use std::os::unix::process::CommandExt;
use std::process::Command;

/// Configures a Command to run inside a sandbox by dropping root privileges
/// and setting resource limits. Called via `pre_exec` before the child spawns.
///
/// Security measures applied:
/// 1. Drops root → runs as the real user (SUDO_UID/SUDO_GID)
/// 2. Isolates network via CLONE_NEWNET (if capable)
///
/// NOTE: No RLIMIT restrictions are applied — they would interfere with
/// memory and threading profiling (VM reservation, thread count, FDs).
pub fn apply_sandbox(cmd: &mut Command) -> &mut Command {
    let real_uid = get_real_uid();
    let real_gid = get_real_gid();

    unsafe {
        cmd.pre_exec(move || {
            // Isolate network namespace (prevents outbound connections)
            let _ = libc::unshare(libc::CLONE_NEWNET);

            // Drop privileges: set GID first, then UID (order matters)
            if real_gid != 0 {
                if libc::setgid(real_gid) != 0 {
                    return Err(std::io::Error::last_os_error());
                }
            }
            if real_uid != 0 {
                if libc::setuid(real_uid) != 0 {
                    return Err(std::io::Error::last_os_error());
                }
            }

            // Verify we actually dropped root
            if libc::getuid() == 0 && real_uid != 0 {
                eprintln!("WARNING: Failed to drop root privileges for child process");
                return Err(std::io::Error::new(
                    std::io::ErrorKind::PermissionDenied,
                    "Failed to drop root privileges",
                ));
            }

            Ok(())
        });
    }

    cmd
}

/// Gets the real (pre-sudo) UID from SUDO_UID env var, or falls back to getuid().
fn get_real_uid() -> u32 {
    std::env::var("SUDO_UID")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or_else(|| unsafe { libc::getuid() })
}

/// Gets the real (pre-sudo) GID from SUDO_GID env var, or falls back to getgid().
fn get_real_gid() -> u32 {
    std::env::var("SUDO_GID")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or_else(|| unsafe { libc::getgid() })
}
