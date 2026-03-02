use crate::engine::concurrency::ThreadMetrics;
use crate::engine::footprint::ArtifactFootprint;
use crate::engine::languages::{Language, MetricCapabilities};

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct GcMetrics {
    pub gc_count: u32,
    pub total_pause_ms: f64,
    pub avg_pause_ms: f64,
    pub max_pause_ms: f64,
    pub pause_std_dev_ms: f64,
    pub heap_before_mb: f64,
    pub heap_after_mb: f64,
    pub tracemalloc_peak_kb: Option<u64>,
}
use crate::engine::profiler::DataPoint;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Result type that carries an error message string to the frontend
pub type EngineResult<T> = Result<T, String>;

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct HeapAnalysis {
    pub total_allocated_bytes: u64,
    pub malloc_count: u64,
    pub free_count: u64,
    pub avg_lifespan_ms: f64,
    pub size_distribution: HashMap<u64, u64>,
    /// Number of mmap allocations tracked
    pub mmap_mmap_count: u64,
    /// Number of munmap deallocations tracked
    pub mmap_munmap_count: u64,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExperimentResults {
    pub language: Language,
    pub variant_id: String,
    pub capabilities: MetricCapabilities,
    pub telemetry: Vec<DataPoint>,
    pub heap_snapshot: Option<HashMap<u64, u64>>,
    pub analysis: HeapAnalysis,
    pub artifact_footprint: Option<ArtifactFootprint>,
    pub concurrency: Option<ThreadMetrics>,
    pub gc_metrics: Option<GcMetrics>,
    pub idle_rss_kb: Option<u64>,
}
