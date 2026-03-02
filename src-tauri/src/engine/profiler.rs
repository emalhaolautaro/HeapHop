use serde::{Deserialize, Serialize};
use std::fs;
use std::process::Child;
use std::thread;
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DataPoint {
    #[serde(alias = "time_ms")]
    pub time_ms: u64,
    #[serde(alias = "rss_kb")]
    pub rss_kb: u64,
    #[serde(alias = "vm_kb")]
    pub vm_kb: u64,
    #[serde(alias = "faults_minor")]
    pub faults_minor: u64,
    #[serde(alias = "faults_major")]
    pub faults_major: u64,
}

/// Profiles a given PID by reading /proc/[pid]/statm and /proc/[pid]/stat
/// every `interval_ms` until the process exits.
pub fn profile_pid(
    pid: u32,
    interval_ms: u64,
    child: &mut Child,
) -> (
    Vec<DataPoint>,
    Option<crate::engine::concurrency::ThreadMetrics>,
) {
    let mut series = Vec::new();
    let mut last_thread_metrics = None;
    let start_time = Instant::now();
    let statm_path = format!("/proc/{}/statm", pid);
    let stat_path = format!("/proc/{}/stat", pid);
    let page_size_kb = 4;

    loop {
        if let Ok(Some(_)) = child.try_wait() {
            break;
        }

        let statm_data = match fs::read_to_string(&statm_path) {
            Ok(data) => data,
            Err(_) => break,
        };

        let parts: Vec<&str> = statm_data.split_whitespace().collect();
        let vm_pages: u64 = parts.get(0).and_then(|s| s.parse().ok()).unwrap_or(0);
        let rss_pages: u64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);

        let (minflt, majflt) = read_page_faults(&stat_path);

        series.push(DataPoint {
            time_ms: start_time.elapsed().as_millis() as u64,
            rss_kb: rss_pages * page_size_kb,
            vm_kb: vm_pages * page_size_kb,
            faults_minor: minflt,
            faults_major: majflt,
        });

        if let Some(tm) = crate::engine::concurrency::poll_context_switches(pid) {
            last_thread_metrics = Some(tm);
        }

        thread::sleep(Duration::from_millis(interval_ms));
    }

    (series, last_thread_metrics)
}

fn read_page_faults(stat_path: &str) -> (u64, u64) {
    if let Ok(stat_data) = fs::read_to_string(stat_path) {
        if let Some(rparen_idx) = stat_data.rfind(')') {
            let after_paren = &stat_data[rparen_idx + 1..];
            let stat_parts: Vec<&str> = after_paren.split_whitespace().collect();
            let minflt = stat_parts.get(7).and_then(|s| s.parse().ok()).unwrap_or(0);
            let majflt = stat_parts.get(9).and_then(|s| s.parse().ok()).unwrap_or(0);
            return (minflt, majflt);
        }
    }
    (0, 0)
}
