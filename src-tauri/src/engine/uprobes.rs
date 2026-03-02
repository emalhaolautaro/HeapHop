use aya::programs::{TracePoint, UProbe};
use aya::Bpf;

const LIBC_PATH: &str = "/usr/lib/x86_64-linux-gnu/libc.so.6";

/// Attach malloc/free/calloc/realloc uprobes to the target PID.
pub fn attach_malloc_probes(bpf: &mut Bpf, pid: u32) -> Result<(), String> {
    attach_uprobe(bpf, "heaphop_malloc", "malloc", pid)?;
    attach_uretprobe(bpf, "heaphop_malloc_ret", "malloc", pid)?;
    attach_uprobe(bpf, "heaphop_free", "free", pid)?;

    // Calloc & Realloc entry probes
    for sym in ["calloc", "realloc"] {
        let prog_name = format!("heaphop_{}", sym);
        if let Some(prog_base) = bpf.program_mut(&prog_name) {
            let prog: &mut UProbe = prog_base
                .try_into()
                .map_err(|e| format!("Bad type: {}", e))?;
            prog.load()
                .map_err(|e| format!("Load error {}: {}", sym, e))?;
            prog.attach(Some(sym), 0, LIBC_PATH, Some(pid.try_into().unwrap()))
                .map_err(|e| format!("Attach error {}: {}", sym, e))?;
        }
    }

    // Shared return probe for calloc/realloc (reuses heaphop_malloc_ret)
    if let Some(ret_prog_base) = bpf.program_mut("heaphop_malloc_ret") {
        let ret_prog: &mut UProbe = ret_prog_base
            .try_into()
            .map_err(|e| format!("Bad type: {}", e))?;
        for sym in ["calloc", "realloc"] {
            let _ = ret_prog.attach(Some(sym), 0, LIBC_PATH, Some(pid.try_into().unwrap()));
        }
    }

    Ok(())
}

/// Attach mmap/munmap tracepoints (system-wide, filtered by PID in BPF).
pub fn attach_mmap_tracepoints(bpf: &mut Bpf) -> Result<(), String> {
    // sys_enter_mmap
    if let Some(prog) = bpf.program_mut("heaphop_mmap_enter") {
        let tp: &mut TracePoint = prog
            .try_into()
            .map_err(|e| format!("mmap_enter type error: {}", e))?;
        tp.load()
            .map_err(|e| format!("mmap_enter load error: {}", e))?;
        tp.attach("syscalls", "sys_enter_mmap")
            .map_err(|e| format!("mmap_enter attach error: {}", e))?;
    }

    // sys_exit_mmap
    if let Some(prog) = bpf.program_mut("heaphop_mmap_exit") {
        let tp: &mut TracePoint = prog
            .try_into()
            .map_err(|e| format!("mmap_exit type error: {}", e))?;
        tp.load()
            .map_err(|e| format!("mmap_exit load error: {}", e))?;
        tp.attach("syscalls", "sys_exit_mmap")
            .map_err(|e| format!("mmap_exit attach error: {}", e))?;
    }

    // sys_enter_munmap
    if let Some(prog) = bpf.program_mut("heaphop_munmap") {
        let tp: &mut TracePoint = prog
            .try_into()
            .map_err(|e| format!("munmap type error: {}", e))?;
        tp.load().map_err(|e| format!("munmap load error: {}", e))?;
        tp.attach("syscalls", "sys_enter_munmap")
            .map_err(|e| format!("munmap attach error: {}", e))?;
    }

    Ok(())
}

fn attach_uprobe(bpf: &mut Bpf, prog_name: &str, sym: &str, pid: u32) -> Result<(), String> {
    let prog: &mut UProbe = bpf
        .program_mut(prog_name)
        .ok_or(format!("{} not found in BPF", prog_name))?
        .try_into()
        .map_err(|e| format!("Invalid program type: {}", e))?;

    prog.load()
        .map_err(|e| format!("Failed to load {}: {}", prog_name, e))?;
    prog.attach(Some(sym), 0, LIBC_PATH, Some(pid.try_into().unwrap()))
        .map_err(|e| format!("Failed to attach {}: {}", prog_name, e))?;

    Ok(())
}

fn attach_uretprobe(bpf: &mut Bpf, prog_name: &str, sym: &str, pid: u32) -> Result<(), String> {
    let prog: &mut UProbe = bpf
        .program_mut(prog_name)
        .ok_or(format!("{} not found in BPF", prog_name))?
        .try_into()
        .map_err(|e| format!("Invalid program type: {}", e))?;

    prog.load()
        .map_err(|e| format!("Failed to load {}: {}", prog_name, e))?;
    prog.attach(Some(sym), 0, LIBC_PATH, Some(pid.try_into().unwrap()))
        .map_err(|e| format!("Failed to attach {}: {}", prog_name, e))?;

    Ok(())
}
