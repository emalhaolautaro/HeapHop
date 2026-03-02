use std::collections::HashMap;
use std::path::Path;
use std::process::{Command, Stdio};

/// Characters that could enable shell injection if passed to Command.
const FORBIDDEN_CHARS: &[char] = &[
    ';', '|', '&', '`', '$', '(', ')', '{', '}', '<', '>', '!', '\n', '\r',
];

/// Replaces {foo} placeholders with values from the given map.
pub fn interpolate_command(tpl: &str, vars: &HashMap<&str, String>) -> String {
    let mut result = tpl.to_string();
    for (k, v) in vars {
        let pattern = format!("{{{}}}", k);
        result = result.replace(&pattern, v);
    }
    result
}

/// Validates the user-selected file path for basic safety.
pub fn validate_file_path(file_path: &str) -> Result<(), String> {
    if file_path.is_empty() {
        return Err("File path is empty".into());
    }

    for ch in FORBIDDEN_CHARS {
        if file_path.contains(*ch) {
            return Err(format!(
                "Security: file path contains forbidden character '{}'.",
                ch
            ));
        }
    }

    if !Path::new(file_path).is_absolute() {
        return Err("Security: file path must be absolute.".into());
    }

    if !Path::new(file_path).exists() {
        return Err(format!("File not found: {}", file_path));
    }

    let blocked_prefixes = [
        "/etc",
        "/usr/bin",
        "/usr/sbin",
        "/sbin",
        "/bin",
        "/boot",
        "/dev",
        "/proc",
        "/sys",
    ];
    for prefix in &blocked_prefixes {
        if file_path.starts_with(prefix) {
            return Err(format!(
                "Security: cannot execute files from system directory '{}'.",
                prefix
            ));
        }
    }

    Ok(())
}

/// Splits a command string into (env_vars, remaining_parts).
/// Tokens matching `KEY=VALUE` at the start are treated as env vars.
fn split_env_prefix(cmd_string: &str) -> (Vec<(&str, &str)>, Vec<&str>) {
    let parts: Vec<&str> = cmd_string.split_whitespace().collect();
    let mut env_vars = Vec::new();
    let mut cmd_start = 0;

    for part in &parts {
        if let Some(eq_pos) = part.find('=') {
            let key = &part[..eq_pos];
            let value = &part[eq_pos + 1..];
            if !key.is_empty() && key.chars().all(|c| c.is_ascii_alphanumeric() || c == '_') {
                env_vars.push((key, value));
                cmd_start += 1;
                continue;
            }
        }
        break;
    }

    (env_vars, parts[cmd_start..].to_vec())
}

/// Execute a build command synchronously. Commands come from hardcoded
/// language variants so they are trusted — no allowlist validation needed.
pub fn execute_sync(cmd_string: &str) -> Result<(), String> {
    if cmd_string.is_empty() {
        return Ok(()); // Interpreted languages have no build step
    }

    let (env_vars, parts) = split_env_prefix(cmd_string);
    if parts.is_empty() {
        return Err("Build command is empty after parsing".into());
    }

    let mut cmd = Command::new(parts[0]);
    cmd.args(&parts[1..])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    for (key, value) in &env_vars {
        cmd.env(key, value);
    }

    crate::engine::sandbox::apply_sandbox(&mut cmd);

    let result = cmd
        .output()
        .map_err(|e| format!("Failed to spawn {}: {}", parts[0], e))?;

    if !result.status.success() {
        let err_msg = String::from_utf8_lossy(&result.stderr);
        return Err(format!("Build failed: {}", err_msg));
    }

    Ok(())
}
