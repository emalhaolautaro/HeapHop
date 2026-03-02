use super::RuntimeStrategy;
use crate::engine::types::GcMetrics;
use regex::Regex;
use std::process::Command;

pub struct GoStrategy;

impl RuntimeStrategy for GoStrategy {
    fn inject_gc_flags(&self, cmd: &mut Command) {
        cmd.env("GODEBUG", "gctrace=1");
    }

    fn parse_gc_output(&self, _stdout: &str, stderr: &str) -> Option<GcMetrics> {
        let gc_re = Regex::new(
            r"(\d+\.?\d*)\+.*?\s+ms\s+clock.*?(\d+\.?\d*)->(\d+\.?\d*)->(\d+\.?\d*)\s+MB",
        )
        .ok()?;

        let mut gc_count = 0u32;
        let mut total_pause = 0.0f64;
        let mut max_pause = 0.0f64;
        let mut last_heap_before = 0.0f64;
        let mut last_heap_after = 0.0f64;
        let mut pauses = Vec::new();

        for line in stderr.lines() {
            if let Some(caps) = gc_re.captures(line) {
                gc_count += 1;
                let stw_pause: f64 = caps[1].parse().unwrap_or(0.0);
                total_pause += stw_pause;
                pauses.push(stw_pause);
                if stw_pause > max_pause {
                    max_pause = stw_pause;
                }
                last_heap_before = caps[2].parse().unwrap_or(0.0);
                last_heap_after = caps[4].parse().unwrap_or(0.0);
            }
        }

        if gc_count == 0 {
            return None;
        }

        let avg_pause_ms = total_pause / gc_count as f64;
        let variance = pauses
            .iter()
            .map(|&p| (p - avg_pause_ms).powi(2))
            .sum::<f64>()
            / gc_count as f64;
        let pause_std_dev_ms = variance.sqrt();

        Some(GcMetrics {
            gc_count,
            total_pause_ms: total_pause,
            avg_pause_ms,
            max_pause_ms: max_pause,
            pause_std_dev_ms,
            heap_before_mb: last_heap_before,
            heap_after_mb: last_heap_after,
            tracemalloc_peak_kb: None,
        })
    }
}
