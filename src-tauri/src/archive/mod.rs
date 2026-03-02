pub mod reports;

pub use reports::*;

use std::fs;

pub fn list_reports() -> Result<Vec<ReportSummary>, String> {
    let dir = get_history_dir();
    if !dir.exists() {
        return Ok(Vec::new());
    }

    let mut reports = Vec::new();
    let entries = fs::read_dir(dir).map_err(|e| format!("Failed reading history dir: {}", e))?;

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("json") {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(report) = serde_json::from_str::<RunReport>(&content) {
                    reports.push(ReportSummary {
                        filename: entry.file_name().to_string_lossy().into_owned(),
                        variant_id: report.metadata.variant_id,
                        program_file: report.metadata.program_file,
                        timestamp: report.metadata.timestamp,
                    });
                }
            }
        }
    }

    reports.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    Ok(reports)
}

pub fn load_report(filename: String) -> Result<RunReport, String> {
    let mut path = get_history_dir();
    let safe_filename = std::path::Path::new(&filename)
        .file_name()
        .ok_or("Invalid filename")?;
    path.push(safe_filename);

    let content =
        fs::read_to_string(&path).map_err(|e| format!("Failed to read report file: {}", e))?;
    let report: RunReport =
        serde_json::from_str(&content).map_err(|e| format!("Invalid JSON structure: {}", e))?;
    Ok(report)
}

pub fn delete_report(filename: String) -> Result<(), String> {
    let mut path = get_history_dir();
    let safe_filename = std::path::Path::new(&filename)
        .file_name()
        .ok_or("Invalid filename")?;
    path.push(safe_filename);

    if path.exists() {
        fs::remove_file(path).map_err(|e| format!("Failed to delete report: {}", e))?;
    }
    Ok(())
}
