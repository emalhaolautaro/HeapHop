use crate::engine::profiler::DataPoint;

/// Aggregates multiple runs by averaging the data points at each time slice.
pub fn aggregate_runs(runs: Vec<Vec<DataPoint>>) -> Vec<DataPoint> {
    if runs.is_empty() {
        return Vec::new();
    }

    let max_len = runs.iter().map(|r| r.len()).max().unwrap_or(0);
    let mut averaged = Vec::with_capacity(max_len);

    for i in 0..max_len {
        let mut sum_time = 0u64;
        let mut sum_rss = 0u64;
        let mut sum_vm = 0u64;
        let mut sum_minflt = 0u64;
        let mut sum_majflt = 0u64;
        let mut count = 0u64;

        for run in &runs {
            if i < run.len() {
                let pt = &run[i];
                sum_time += pt.time_ms;
                sum_rss += pt.rss_kb;
                sum_vm += pt.vm_kb;
                sum_minflt += pt.faults_minor;
                sum_majflt += pt.faults_major;
                count += 1;
            }
        }

        if count > 0 {
            averaged.push(DataPoint {
                time_ms: sum_time / count,
                rss_kb: sum_rss / count,
                vm_kb: sum_vm / count,
                faults_minor: sum_minflt / count,
                faults_major: sum_majflt / count,
            });
        }
    }

    averaged
}
