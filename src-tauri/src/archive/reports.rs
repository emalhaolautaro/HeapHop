use crate::engine::concurrency::ThreadMetrics;
use crate::engine::footprint::ArtifactFootprint;
use crate::engine::languages::{Language, MetricCapabilities};
use crate::engine::profiler::DataPoint;
use crate::engine::types::GcMetrics;
use crate::engine::types::{ExperimentResults, HeapAnalysis};
use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportMetadata {
    pub variant_id: String,
    pub language: Language,
    pub program_file: String,
    pub iterations: u32,
    pub warmups: u32,
    pub timestamp: u64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RunReport {
    pub metadata: ReportMetadata,
    pub capabilities: MetricCapabilities,
    pub telemetry: Vec<DataPoint>,
    pub heap_snapshot: Option<std::collections::HashMap<u64, u64>>,
    pub analysis: Option<HeapAnalysis>,
    pub artifact_footprint: Option<ArtifactFootprint>,
    pub concurrency: Option<ThreadMetrics>,
    pub gc_metrics: Option<GcMetrics>,
    pub idle_rss_kb: Option<u64>,
}

pub fn get_history_dir() -> PathBuf {
    let mut dir = env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    if dir.ends_with("src-tauri") {
        dir.pop();
    }
    dir.push("heaphop_history");
    dir
}

pub fn save_report(
    variant_id: String,
    program_file: String,
    iterations: u32,
    warmups: u32,
    results: &ExperimentResults,
) -> Result<String, String> {
    let dir = get_history_dir();
    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create history directory: {}", e))?;
    }

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let safe_variant = variant_id.replace('/', "_");
    let safe_file = std::path::Path::new(&program_file)
        .file_name()
        .and_then(|f| f.to_str())
        .unwrap_or("unknown")
        .replace('/', "_");

    let filename = format!("{}_{}_{}.json", timestamp, safe_variant, safe_file);
    let filepath = dir.join(&filename);

    let report = RunReport {
        metadata: ReportMetadata {
            variant_id,
            language: results.language,
            program_file,
            iterations,
            warmups,
            timestamp,
        },
        capabilities: results.capabilities.clone(),
        telemetry: results.telemetry.clone(),
        heap_snapshot: results.heap_snapshot.clone(),
        analysis: Some(results.analysis.clone()),
        artifact_footprint: results.artifact_footprint.clone(),
        concurrency: results.concurrency.clone(),
        gc_metrics: results.gc_metrics.clone(),
        idle_rss_kb: results.idle_rss_kb,
    };

    let json_data =
        serde_json::to_string_pretty(&report).map_err(|e| format!("Serialization error: {}", e))?;
    fs::write(&filepath, json_data).map_err(|e| format!("Failed to write report file: {}", e))?;

    Ok(filename)
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportSummary {
    pub filename: String,
    pub variant_id: String,
    pub program_file: String,
    pub timestamp: u64,
}
