use crate::engine::aggregator;
use crate::engine::compiler::{execute_sync, interpolate_command, validate_file_path};
use crate::engine::concurrency::{self, ThreadMetrics};
use crate::engine::footprint;
use crate::engine::languages::{self, Language, LanguageVariant, MetricCapabilities};
use crate::engine::profiler::DataPoint;
use crate::engine::runtimes::{get_strategy, RuntimeStrategy};
use crate::engine::types::GcMetrics;
use crate::engine::types::{EngineResult, ExperimentResults, HeapAnalysis};
use std::collections::HashMap;
use std::process::{Command, Stdio};
use tauri::{AppHandle, Emitter};

/// Poll `/proc/PID/status` until the process state is 'T' (stopped).
/// This guarantees no instructions run between SIGSTOP and BPF attach.
fn wait_for_stop(pid: u32, max_ms: u64) {
    let status_path = format!("/proc/{}/status", pid);
    let deadline = std::time::Instant::now() + std::time::Duration::from_millis(max_ms);

    loop {
        if let Ok(content) = std::fs::read_to_string(&status_path) {
            for line in content.lines() {
                if line.starts_with("State:") && line.contains("T") {
                    return; // Process is stopped
                }
            }
        }
        if std::time::Instant::now() >= deadline {
            println!(
                "Warning: wait_for_stop timed out after {}ms for PID {}",
                max_ms, pid
            );
            return;
        }
        std::thread::sleep(std::time::Duration::from_millis(1));
    }
}

fn run_single_pass(
    handle: &AppHandle,
    run_cmd_parts: &[String],
    poll_interval_ms: u64,
    strategy: &Box<dyn RuntimeStrategy>,
    caps: &MetricCapabilities,
) -> EngineResult<(
    Vec<DataPoint>,
    Option<HashMap<u64, u64>>,
    Option<HeapAnalysis>,
    Option<ThreadMetrics>,
    Option<GcMetrics>,
    Option<u64>,
)> {
    let _ = handle.emit("heap-reset", ());

    let mut cmd = Command::new(&run_cmd_parts[0]);
    cmd.args(&run_cmd_parts[1..]);
    cmd.stdout(Stdio::piped()).stderr(Stdio::piped());

    // Inject GC flags for managed languages
    if caps.gc_metrics {
        strategy.inject_gc_flags(&mut cmd);
    }

    crate::engine::sandbox::apply_sandbox(&mut cmd);

    let mut child = cmd
        .spawn()
        .map_err(|e| format!("Failed to run executable ({}): {}", run_cmd_parts[0], e))?;

    let pid = child.id();

    // Stop the child and wait until it's actually stopped before attaching BPF.
    // This eliminates the race where the child runs instructions between spawn and SIGSTOP.
    unsafe {
        libc::kill(pid as i32, libc::SIGSTOP);
    }
    wait_for_stop(pid, 500);

    // Attach BPF based on capabilities
    let (mut _bpf_guard, mut current_heap_state, mut current_analysis) = (None, None, None);
    let should_attach_malloc = caps.ebpf_malloc;
    let should_attach_mmap = caps.ebpf_mmap;

    if should_attach_malloc || should_attach_mmap {
        match crate::engine::bpf_loader::attach_bpf(
            pid,
            handle.clone(),
            should_attach_malloc,
            should_attach_mmap,
        ) {
            Ok((bpf, state, ana)) => {
                println!("eBPF Attached successfully to PID {}", pid);
                _bpf_guard = Some(bpf);
                current_heap_state = Some(state);
                current_analysis = Some(ana);
            }
            Err(e) => println!("BPF Profiling skipped: {}", e),
        };
    }

    let mut idle_rss_kb = None;
    if let Ok(statm) = std::fs::read_to_string(format!("/proc/{}/statm", pid)) {
        if let Some(rss_pages) = statm.split_whitespace().nth(1) {
            if let Ok(pages) = rss_pages.parse::<u64>() {
                idle_rss_kb = Some(pages * 4); // 4KB pages
            }
        }
    }

    unsafe {
        libc::kill(pid as i32, libc::SIGCONT);
    }

    let (telemetry, ctx_switches) =
        crate::engine::profiler::profile_pid(pid, poll_interval_ms, &mut child);
    let output = child
        .wait_with_output()
        .map_err(|e| format!("Wait failed: {}", e))?;

    std::thread::sleep(std::time::Duration::from_millis(100));

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    let gc = if caps.gc_metrics {
        strategy.parse_gc_output(&stdout, &stderr)
    } else {
        None
    };

    let snapshot =
        current_heap_state.and_then(|state_arc| state_arc.lock().ok().map(|state| state.clone()));
    let analysis = current_analysis.and_then(|ana_arc| ana_arc.lock().ok().map(|ana| ana.clone()));

    Ok((telemetry, snapshot, analysis, ctx_switches, gc, idle_rss_kb))
}

/// Main entry point for the frontend to launch an experiment.
pub fn run_experiment(
    handle: AppHandle,
    variant_id: String,
    file_path: String,
    iterations: u32,
    warmups: u32,
) -> EngineResult<ExperimentResults> {
    validate_file_path(&file_path)?;

    let variant: &LanguageVariant = languages::find_variant(&variant_id)
        .ok_or_else(|| format!("Unknown variant: {}", variant_id))?;

    let lang = variant.language;
    let mut caps = languages::capabilities(lang);
    let strategy = get_strategy(lang);

    // CGO variant gets malloc probes
    if languages::is_cgo_variant(variant) {
        caps.ebpf_malloc = true;
    }

    // Build interpolation variables
    let mut vars = HashMap::new();
    vars.insert("file", file_path.clone());

    let path = std::path::Path::new(&file_path);
    let file_stem = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("unknown");
    let file_dir = path.parent().and_then(|p| p.to_str()).unwrap_or(".");

    let out_filename = format!("heaphop_bin_{}_{}", file_stem, std::process::id());
    let out_path = std::env::temp_dir().join(&out_filename);
    vars.insert("out", out_path.to_string_lossy().into_owned());
    vars.insert(
        "outDir",
        std::env::temp_dir().to_string_lossy().into_owned(),
    );
    vars.insert("fileNameWithoutExt", file_stem.to_string());
    vars.insert("fileDir", file_dir.to_string());

    // Build step (if applicable)
    let mut footprint_result = None;
    let mut java_class_path = None;
    if !variant.build_cmd.is_empty() {
        let final_build = interpolate_command(variant.build_cmd, &vars);

        if lang == Language::Java {
            java_class_path = Some(std::env::temp_dir().join(format!("{}.class", file_stem)));
        }

        // CGO needs special env
        if languages::is_cgo_variant(variant) {
            // CGO_ENABLED is embedded in the build_cmd template as env prefix
            // but we also need to handle it — execute_sync handles KEY=VALUE prefixes
        }

        execute_sync(&final_build)?;

        if caps.artifact_footprint {
            footprint_result = footprint::get_footprint(&out_path.to_string_lossy());
        }
    }

    // Prepare run command
    let final_run = interpolate_command(variant.run_cmd, &vars);
    let base_parts: Vec<&str> = final_run.split_whitespace().collect();
    if base_parts.is_empty() {
        return Err("Run command is empty".into());
    }

    // Apply runtime-specific command transformations
    let (parts, wrapper_path) = strategy.prepare_run(&base_parts)?;

    // Run iterations
    let total_runs = iterations + warmups;
    let mut all_telemetry = Vec::new();
    let mut last_heap_snapshot = None;
    let mut last_analysis = HeapAnalysis::default();
    let mut last_ctx = None;
    let mut last_gc: Option<GcMetrics> = None;
    let mut last_idle_rss = None;

    for i in 0..total_runs {
        let (telemetry, snapshot, analysis, ctx, gc, idle_rss) =
            run_single_pass(&handle, &parts, 5, &strategy, &caps)?;
        if i >= warmups {
            // Accumulate Heap Snapshot
            if let Some(snap) = snapshot {
                let mut current: HashMap<u64, u64> = last_heap_snapshot.unwrap_or_default();
                current.extend(snap);
                last_heap_snapshot = Some(current);
            }

            // Accumulate Analysis Counts
            if let Some(ana) = analysis {
                if caps.profile == crate::engine::languages::ProfileType::Manual {
                    let mut curr = last_analysis;
                    curr.total_allocated_bytes += ana.total_allocated_bytes;
                    curr.malloc_count += ana.malloc_count;
                    curr.free_count += ana.free_count;
                    curr.mmap_mmap_count += ana.mmap_mmap_count;
                    curr.mmap_munmap_count += ana.mmap_munmap_count;
                    if curr.avg_lifespan_ms == 0.0 {
                        curr.avg_lifespan_ms = ana.avg_lifespan_ms;
                    } else if ana.avg_lifespan_ms > 0.0 {
                        curr.avg_lifespan_ms = (curr.avg_lifespan_ms + ana.avg_lifespan_ms) / 2.0;
                    }
                    for (k, v) in ana.size_distribution {
                        *curr.size_distribution.entry(k).or_insert(0) += v;
                    }
                    last_analysis = curr;
                }
            }

            // Accumulate Context Switches / Threads
            if let Some(c) = ctx {
                let mut current =
                    last_ctx.unwrap_or_else(|| crate::engine::concurrency::ThreadMetrics {
                        nonvoluntary: 0,
                        voluntary: 0,
                        thread_count: 0,
                        threads_peak: 0,
                    });
                current.voluntary += c.voluntary;
                current.nonvoluntary += c.nonvoluntary;
                current.thread_count = c.thread_count.max(current.thread_count);
                current.threads_peak = c.threads_peak.max(current.threads_peak);
                last_ctx = Some(current);
            }

            if let Some(curr_gc) = gc {
                if let Some(mut prev_gc) = last_gc.take() {
                    prev_gc.gc_count += curr_gc.gc_count;
                    prev_gc.total_pause_ms += curr_gc.total_pause_ms;
                    prev_gc.max_pause_ms = prev_gc.max_pause_ms.max(curr_gc.max_pause_ms);
                    prev_gc.heap_before_mb = curr_gc.heap_before_mb.max(prev_gc.heap_before_mb);
                    prev_gc.heap_after_mb = curr_gc.heap_after_mb.max(prev_gc.heap_after_mb);
                    if let Some(peak) = curr_gc.tracemalloc_peak_kb {
                        prev_gc.tracemalloc_peak_kb =
                            Some(prev_gc.tracemalloc_peak_kb.unwrap_or(0).max(peak));
                    }
                    // avg_pause_ms depends on individual lists technically, but we recompute it
                    if prev_gc.gc_count > 0 {
                        prev_gc.avg_pause_ms = prev_gc.total_pause_ms / prev_gc.gc_count as f64;
                    }
                    last_gc = Some(prev_gc);
                } else {
                    last_gc = Some(curr_gc);
                }
            }
            if idle_rss.is_some() {
                last_idle_rss = idle_rss;
            }
            all_telemetry.push(telemetry);
        }
    }

    // Average the accumulated values by the number of legitimate iterations!
    if iterations > 1 {
        last_analysis.total_allocated_bytes /= iterations as u64;
        last_analysis.malloc_count /= iterations as u64;
        last_analysis.free_count /= iterations as u64;
        last_analysis.mmap_mmap_count /= iterations as u64;
        last_analysis.mmap_munmap_count /= iterations as u64;
        for v in last_analysis.size_distribution.values_mut() {
            *v /= iterations as u64;
        }

        if let Some(mut ctx) = last_ctx.take() {
            ctx.voluntary /= iterations as u64;
            ctx.nonvoluntary /= iterations as u64;
            last_ctx = Some(ctx);
        }

        if let Some(mut gc) = last_gc.take() {
            gc.gc_count /= iterations as u32;
            gc.total_pause_ms /= iterations as f64;
            last_gc = Some(gc);
        }
    }

    let final_telemetry = aggregator::aggregate_runs(all_telemetry);

    // Cleanup
    std::fs::remove_file(&out_path).ok();
    if let Some(path) = java_class_path {
        std::fs::remove_file(path).ok();
    }
    if let Some(wrapper) = wrapper_path {
        std::fs::remove_file(wrapper).ok();
    }

    Ok(ExperimentResults {
        language: lang,
        variant_id,
        capabilities: caps,
        telemetry: final_telemetry,
        heap_snapshot: last_heap_snapshot,
        analysis: last_analysis,
        artifact_footprint: footprint_result,
        concurrency: last_ctx,
        gc_metrics: last_gc,
        idle_rss_kb: last_idle_rss,
    })
}
