mod engine;
mod archive;

#[tauri::command]
async fn start_experiment(
    handle: tauri::AppHandle,
    variant_id: String,
    file_path: String,
    iterations: u32,
    warmups: u32,
) -> Result<engine::types::ExperimentResults, String> {
    let results = engine::runner::run_experiment(
        handle,
        variant_id.clone(),
        file_path.clone(),
        iterations,
        warmups,
    )?;

    let _ = archive::save_report(
        variant_id,
        file_path,
        iterations,
        warmups,
        &results,
    );

    Ok(results)
}

#[tauri::command]
async fn list_languages() -> Vec<engine::languages::VariantInfo> {
    engine::languages::list_all_variants()
}

#[tauri::command]
async fn list_history() -> Result<Vec<archive::ReportSummary>, String> {
    archive::list_reports()
}

#[tauri::command]
async fn load_report(filename: String) -> Result<archive::RunReport, String> {
    archive::load_report(filename)
}

#[tauri::command]
async fn delete_history_item(filename: String) -> Result<(), String> {
    archive::delete_report(filename)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            start_experiment,
            list_languages,
            list_history,
            load_report,
            delete_history_item
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
