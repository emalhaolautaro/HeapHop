pub mod go;
pub mod java;
pub mod native;
pub mod python;

use crate::engine::languages::Language;
use crate::engine::types::GcMetrics;
use std::path::PathBuf;
use std::process::Command;

/// A strategy trait for language-specific execution and GC parsing
pub trait RuntimeStrategy {
    /// Modify the run command parts and optionally return a path to a wrapper file to clean up
    fn prepare_run(&self, base_parts: &[&str]) -> Result<(Vec<String>, Option<PathBuf>), String> {
        Ok((base_parts.iter().map(|s| s.to_string()).collect(), None))
    }

    /// Inject necessary environment variables or flags for the language's GC tracing
    fn inject_gc_flags(&self, _cmd: &mut Command) {}

    /// Parse the language's GC logs from stdout/stderr into GcMetrics
    fn parse_gc_output(&self, _stdout: &str, _stderr: &str) -> Option<GcMetrics> {
        None
    }
}

pub fn get_strategy(lang: Language) -> Box<dyn RuntimeStrategy> {
    match lang {
        Language::Java => Box::new(java::JavaStrategy),
        Language::Python => Box::new(python::PythonStrategy),
        Language::Go => Box::new(go::GoStrategy),
        _ => Box::new(native::NativeStrategy),
    }
}
