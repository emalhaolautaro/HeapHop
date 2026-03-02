use tauri::Emitter;
use aya::maps::perf::AsyncPerfEventArray;
use aya::maps::HashMap as BpfHashMap;
use aya::util::online_cpus;
use aya::BpfLoader;
use bytes::BytesMut;
use heaphop_common::AllocationEvent;
use std::collections::HashMap;
use std::fs;
use std::sync::{Arc, Mutex};
use tokio::task;
use crate::engine::types::HeapAnalysis;
use crate::engine::uprobes;

/// Attach BPF with capability-driven probe selection.
/// `attach_malloc`: attach malloc/free uprobes (for native languages)
/// `attach_mmap`: attach mmap/munmap tracepoints (for all languages)
pub fn attach_bpf(
    pid: u32,
    handle: tauri::AppHandle,
    attach_malloc: bool,
    attach_mmap: bool,
) -> Result<(aya::Bpf, Arc<Mutex<HashMap<u64, u64>>>, Arc<Mutex<HeapAnalysis>>), String> {
    let heap_state = Arc::new(Mutex::new(HashMap::new()));
    let analysis = Arc::new(Mutex::new(HeapAnalysis::default()));

    let bpf_bytes = load_bpf_bytecode()?;
    println!("Attempting to load BPF bytecode for PID {}...", pid);

    if let Err(e) = rlimit::Resource::MEMLOCK.set(rlimit::INFINITY, rlimit::INFINITY) {
        println!("Warning: Failed to set rlimit MEMLOCK: {}", e);
    }

    let mut bpf = BpfLoader::new()
        .load(&bpf_bytes)
        .map_err(|e| format!("Failed to parse BPF: {} (Requires sudo!)", e))?;

    // Set target PID in BPF map for tracepoint filtering
    {
        let mut target_pid: BpfHashMap<_, u32, u32> = BpfHashMap::try_from(
            bpf.map_mut("TARGET_PID").ok_or("TARGET_PID map not found")?,
        )
        .map_err(|e| format!("Failed to get TARGET_PID map: {}", e))?;
        target_pid
            .insert(0u32, pid, 0)
            .map_err(|e| format!("Failed to set TARGET_PID: {}", e))?;
    }

    // Attach probes based on capabilities
    if attach_malloc {
        uprobes::attach_malloc_probes(&mut bpf, pid)?;
    }
    if attach_mmap {
        uprobes::attach_mmap_tracepoints(&mut bpf)?;
    }

    setup_event_listener(&mut bpf, pid, handle, &heap_state, &analysis)?;

    Ok((bpf, heap_state, analysis))
}

fn load_bpf_bytecode() -> Result<Vec<u8>, String> {
    let paths = [
        "target/bpfel-unknown-none/release/heaphop-bpf",
        "src-tauri/target/bpfel-unknown-none/release/heaphop-bpf",
        "target/bpfel-unknown-none/debug/heaphop-bpf",
        "src-tauri/target/bpfel-unknown-none/debug/heaphop-bpf",
    ];

    for path in &paths {
        if let Ok(bytes) = fs::read(path) {
            return Ok(bytes);
        }
    }

    Err("Failed to read eBPF bytecode from any known path".to_string())
}

fn setup_event_listener(
    bpf: &mut aya::Bpf,
    pid: u32,
    handle: tauri::AppHandle,
    heap_state: &Arc<Mutex<HashMap<u64, u64>>>,
    analysis: &Arc<Mutex<HeapAnalysis>>,
) -> Result<(), String> {
    let mut perf_array = AsyncPerfEventArray::try_from(bpf.take_map("EVENTS").unwrap())
        .map_err(|e| format!("Failed to get EVENTS map: {}", e))?;

    for cpu_id in online_cpus().map_err(|e| format!("CPU error: {}", e))? {
        let mut buf = perf_array
            .open(cpu_id, None)
            .map_err(|e| format!("Failed to open perf buffer: {}", e))?;

        let h = handle.clone();
        let state = Arc::clone(heap_state);
        let ana = Arc::clone(analysis);
        let mut birth_times: HashMap<u64, (u64, u64)> = HashMap::new();
        let mut total_lifespan_ns = 0u64;
        let mut completed_lifespans = 0u64;

        task::spawn(async move {
            let mut buffers: Vec<BytesMut> = (0..10)
                .map(|_| BytesMut::with_capacity(1024))
                .collect();

            loop {
                let events = buf.read_events(&mut buffers[..]).await.unwrap();
                for i in 0..events.read {
                    let ptr = buffers[i].as_ptr() as *const AllocationEvent;
                    let event = unsafe { ptr.read_unaligned() };

                    if event.pid != pid { continue; }

                    let _ = h.emit("heap-activity", event);

                    match event.event_type {
                        1 => {
                            // free
                            if let Ok(mut s) = state.lock() { s.remove(&event.address); }
                            if let Some((birth, _)) = birth_times.remove(&event.address) {
                                if event.timestamp > birth {
                                    total_lifespan_ns += event.timestamp - birth;
                                    completed_lifespans += 1;
                                }
                            }
                            if let Ok(mut a) = ana.lock() {
                                a.free_count += 1;
                                if completed_lifespans > 0 {
                                    a.avg_lifespan_ms = (total_lifespan_ns as f64 / completed_lifespans as f64) / 1_000_000.0;
                                }
                            }
                        }
                        3 => {
                            // munmap — treat similarly to free
                            if let Ok(mut s) = state.lock() { s.remove(&event.address); }
                            if let Some((birth, _)) = birth_times.remove(&event.address) {
                                if event.timestamp > birth {
                                    total_lifespan_ns += event.timestamp - birth;
                                    completed_lifespans += 1;
                                }
                            }
                            if let Ok(mut a) = ana.lock() {
                                a.mmap_munmap_count += 1;
                                if completed_lifespans > 0 {
                                    a.avg_lifespan_ms = (total_lifespan_ns as f64 / completed_lifespans as f64) / 1_000_000.0;
                                }
                            }
                        }
                        0 => {
                            // malloc/calloc/realloc allocation
                            if let Ok(mut s) = state.lock() { s.insert(event.address, event.size); }
                            birth_times.insert(event.address, (event.timestamp, event.size));
                            if let Ok(mut a) = ana.lock() {
                                a.malloc_count += 1;
                                a.total_allocated_bytes += event.size;
                                *a.size_distribution.entry(event.size).or_insert(0) += 1;
                            }
                        }
                        2 => {
                            // mmap allocation
                            if let Ok(mut s) = state.lock() { s.insert(event.address, event.size); }
                            birth_times.insert(event.address, (event.timestamp, event.size));
                            if let Ok(mut a) = ana.lock() {
                                a.mmap_mmap_count += 1;
                                a.total_allocated_bytes += event.size;
                                *a.size_distribution.entry(event.size).or_insert(0) += 1;
                            }
                        }
                        _ => {}
                    }
                }
            }
        });
    }

    Ok(())
}
