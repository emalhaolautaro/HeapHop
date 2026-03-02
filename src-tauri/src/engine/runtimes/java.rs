use super::RuntimeStrategy;
use crate::engine::types::GcMetrics;
use regex::Regex;
use std::path::PathBuf;

pub struct JavaStrategy;

impl RuntimeStrategy for JavaStrategy {
    fn prepare_run(&self, base_parts: &[&str]) -> Result<(Vec<String>, Option<PathBuf>), String> {
        if base_parts.is_empty() {
            return Ok((Vec::new(), None));
        }
        let mut result = vec![base_parts[0].to_string(), "-Xlog:gc*:stdout".to_string()];
        result.extend(base_parts[1..].iter().map(|s| s.to_string()));
        Ok((result, None))
    }

    fn parse_gc_output(&self, stdout: &str, _stderr: &str) -> Option<GcMetrics> {
        let pause_re = Regex::new(r"\[info\]\[gc\s*\].*?GC\(\d+\).*?\s+(\d+[.,]?\d*)\s*ms").ok()?;
        let heap_re = Regex::new(r"(\d+[.,]?\d*)M->(\d+[.,]?\d*)M").ok()?;

        let mut gc_count = 0u32;
        let mut total_pause = 0.0f64;
        let mut max_pause = 0.0f64;
        let mut last_heap_before = 0.0f64;
        let mut last_heap_after = 0.0f64;
        let mut pauses = Vec::new();

        for line in stdout.lines() {
            if let Some(caps) = pause_re.captures(line) {
                gc_count += 1;
                let pause_str = caps[1].replace(',', ".");
                let pause: f64 = pause_str.parse().unwrap_or(0.0);
                total_pause += pause;
                pauses.push(pause);
                if pause > max_pause {
                    max_pause = pause;
                }
            }
            if let Some(caps) = heap_re.captures(line) {
                let before_str = caps[1].replace(',', ".");
                let after_str = caps[2].replace(',', ".");
                last_heap_before = before_str.parse().unwrap_or(0.0);
                last_heap_after = after_str.parse().unwrap_or(0.0);
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
