use std::fs;
use std::path::Path;
use std::process::Command;

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct ArtifactFootprint {
    pub binary_size_bytes: Option<u64>,
    pub text_size_bytes: Option<u64>,
    pub data_size_bytes: Option<u64>,
}

pub fn get_footprint(binary_path: &str) -> Option<ArtifactFootprint> {
    if !Path::new(binary_path).exists() {
        return None;
    }

    let mut footprint = ArtifactFootprint::default();

    // 1. Get code & data sizes using `size` command
    if let Ok(output) = Command::new("size").arg(binary_path).output() {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);

            // Expected size output format:
            // text    data     bss     dec     hex filename
            // 1234    567      89      1890    762 /path/to/bin
            let mut lines = stdout.lines().skip(1); // skip headers
            if let Some(line) = lines.next() {
                let columns: Vec<&str> = line.split_whitespace().collect();
                if columns.len() >= 3 {
                    if let Ok(text) = columns[0].parse::<u64>() {
                        footprint.text_size_bytes = Some(text);
                    }

                    let mut data_total = 0;
                    if let Ok(data) = columns[1].parse::<u64>() {
                        data_total += data;
                    }
                    if let Ok(bss) = columns[2].parse::<u64>() {
                        data_total += bss;
                    }

                    if data_total > 0 {
                        footprint.data_size_bytes = Some(data_total);
                    }
                }
            }
        }
    }

    // 2. Get stripped binary size
    let stripped_path = format!("{}_stripped", binary_path);
    // Create copy for stripping
    if fs::copy(binary_path, &stripped_path).is_ok() {
        if let Ok(output) = Command::new("strip")
            .arg("--strip-all")
            .arg(&stripped_path)
            .output()
        {
            if output.status.success() {
                if let Ok(metadata) = fs::metadata(&stripped_path) {
                    footprint.binary_size_bytes = Some(metadata.len());
                }
            }
        }
        // Cleanup the temporary stripped copy
        let _ = fs::remove_file(&stripped_path);
    }

    // Only return Some if we managed to collect at least one metric
    if footprint.binary_size_bytes.is_some() || footprint.text_size_bytes.is_some() {
        Some(footprint)
    } else {
        None
    }
}
