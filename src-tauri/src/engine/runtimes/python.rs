use super::RuntimeStrategy;
use crate::engine::types::GcMetrics;
use regex::Regex;
use std::path::PathBuf;

pub struct PythonStrategy;

const PYTHON_WRAPPER: &str = r#"import tracemalloc, sys, runpy, gc, time
tracemalloc.start()

gc_pauses = []
gc_heaps = []
start_time = 0
last_before = 0

def gc_callback(phase, info):
    global start_time, last_before
    if phase == "start":
        start_time = time.perf_counter()
        last_before, _ = tracemalloc.get_traced_memory()
    elif phase == "stop":
        pause_ms = (time.perf_counter() - start_time) * 1000.0
        gc_pauses.append(pause_ms)
        after, _ = tracemalloc.get_traced_memory()
        gc_heaps.append((last_before, after))

if hasattr(gc, 'callbacks'):
    gc.callbacks.append(gc_callback)

target = sys.argv[1]
sys.argv = sys.argv[1:]
runpy.run_path(target, run_name='__main__')
current, peak = tracemalloc.get_traced_memory()
tracemalloc.stop()

print(f"HEAPHOP_TRACEMALLOC:{current},{peak}")
for p in gc_pauses:
    print(f"HEAPHOP_PYTHON_GC_PAUSE:{p:.4f}")
for b, a in gc_heaps:
    print(f"HEAPHOP_PYTHON_GC_HEAP:{b},{a}")
"#;

impl RuntimeStrategy for PythonStrategy {
    fn prepare_run(&self, base_parts: &[&str]) -> Result<(Vec<String>, Option<PathBuf>), String> {
        if base_parts.len() < 2 {
            return Err(
                "Python run command must have at least the executable and the file".to_string(),
            );
        }

        let path =
            std::env::temp_dir().join(format!("heaphop_tracemalloc_{}.py", std::process::id()));
        std::fs::write(&path, PYTHON_WRAPPER)
            .map_err(|e| format!("Failed to write tracemalloc wrapper: {}", e))?;

        let mut result = Vec::new();
        let file = base_parts.last().unwrap();

        // Add all prefix arguments (like python3, -u)
        for p in &base_parts[..base_parts.len() - 1] {
            result.push(p.to_string());
        }
        // Add the wrapper script
        result.push(path.to_string_lossy().into_owned());
        // Add the target script to run
        result.push(file.to_string());

        Ok((result, Some(path)))
    }

    fn parse_gc_output(&self, stdout: &str, _stderr: &str) -> Option<GcMetrics> {
        let tracemalloc_re = Regex::new(r"HEAPHOP_TRACEMALLOC:(\d+),(\d+)").ok()?;
        let pause_re = Regex::new(r"HEAPHOP_PYTHON_GC_PAUSE:([\d\.]+)").ok()?;
        let heap_re = Regex::new(r"HEAPHOP_PYTHON_GC_HEAP:(\d+),(\d+)").ok()?;

        let mut current_bytes = 0u64;
        let mut peak_bytes = 0u64;
        let mut has_mem = false;
        let mut pauses = Vec::new();
        let mut last_heap_before = 0.0f64;
        let mut last_heap_after = 0.0f64;

        for line in stdout.lines() {
            if let Some(caps) = tracemalloc_re.captures(line) {
                current_bytes = caps[1].parse().unwrap_or(0);
                peak_bytes = caps[2].parse().unwrap_or(0);
                has_mem = true;
            } else if let Some(caps) = pause_re.captures(line) {
                if let Ok(pause_ms) = caps[1].parse::<f64>() {
                    pauses.push(pause_ms);
                }
            } else if let Some(caps) = heap_re.captures(line) {
                let before_bytes: u64 = caps[1].parse().unwrap_or(0);
                let after_bytes: u64 = caps[2].parse().unwrap_or(0);
                last_heap_before = before_bytes as f64 / (1024.0 * 1024.0);
                last_heap_after = after_bytes as f64 / (1024.0 * 1024.0);
            }
        }

        if !has_mem {
            return None;
        }

        let gc_count = pauses.len() as u32;
        let mut total_pause_ms = 0.0;
        let mut max_pause_ms = 0.0;
        let mut avg_pause_ms = 0.0;
        let mut pause_std_dev_ms = 0.0;

        if gc_count > 0 {
            total_pause_ms = pauses.iter().sum();
            max_pause_ms = pauses.iter().copied().fold(0.0, f64::max);
            avg_pause_ms = total_pause_ms / gc_count as f64;

            let variance = pauses
                .iter()
                .map(|&p| (p - avg_pause_ms).powi(2))
                .sum::<f64>()
                / gc_count as f64;
            pause_std_dev_ms = variance.sqrt();
        }

        Some(GcMetrics {
            gc_count,
            total_pause_ms,
            avg_pause_ms,
            max_pause_ms,
            pause_std_dev_ms,
            heap_before_mb: last_heap_before,
            heap_after_mb: if last_heap_after > 0.0 {
                last_heap_after
            } else {
                current_bytes as f64 / (1024.0 * 1024.0)
            },
            tracemalloc_peak_kb: Some(peak_bytes / 1024),
        })
    }
}
