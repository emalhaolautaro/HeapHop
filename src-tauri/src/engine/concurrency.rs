use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThreadMetrics {
    #[serde(alias = "voluntary_ctxt_switches")]
    pub voluntary: u64,
    #[serde(alias = "nonvoluntary_ctxt_switches")]
    pub nonvoluntary: u64,
    pub thread_count: u64,
    #[serde(default)]
    pub threads_peak: u64,
}

impl Default for ThreadMetrics {
    fn default() -> Self {
        Self {
            voluntary: 0,
            nonvoluntary: 0,
            thread_count: 0,
            threads_peak: 0,
        }
    }
}

/// Parse `/proc/[pid]/status` for context switches and
/// `/proc/[pid]/task/` for thread count.
pub fn poll_context_switches(pid: u32) -> Option<ThreadMetrics> {
    let status_path = format!("/proc/{}/status", pid);

    let Ok(status_data) = fs::read_to_string(&status_path) else {
        return None;
    };

    let mut metrics = ThreadMetrics::default();

    for line in status_data.lines() {
        if line.starts_with("voluntary_ctxt_switches:") {
            if let Some(val_str) = line.split(':').nth(1) {
                metrics.voluntary = val_str.trim().parse().unwrap_or(0);
            }
        } else if line.starts_with("nonvoluntary_ctxt_switches:") {
            if let Some(val_str) = line.split(':').nth(1) {
                metrics.nonvoluntary = val_str.trim().parse().unwrap_or(0);
            }
        } else if line.starts_with("Threads:") {
            if let Some(val_str) = line.split(':').nth(1) {
                metrics.thread_count = val_str.trim().parse().unwrap_or(0);
            }
        }
    }

    // Also count via /proc/[pid]/task/ for accuracy
    let task_path = format!("/proc/{}/task", pid);
    if let Ok(entries) = fs::read_dir(&task_path) {
        let count = entries.count() as u64;
        if count > metrics.thread_count {
            metrics.thread_count = count;
        }
    }

    metrics.threads_peak = metrics.thread_count;

    Some(metrics)
}
