#![no_std]
#![no_main]

use aya_ebpf::{
    helpers,
    macros::{map, tracepoint, uprobe, uretprobe},
    maps::{HashMap, PerfEventArray},
    programs::{ProbeContext, RetProbeContext, TracePointContext},
    EbpfContext,
};
use aya_log_ebpf::info;
use heaphop_common::AllocationEvent;

#[map]
static EVENTS: PerfEventArray<AllocationEvent> = PerfEventArray::new(0);

// Temporarily store the requested size keyed by thread ID
#[map]
static ACTIVE_SIZES: HashMap<u32, u64> = HashMap::with_max_entries(1024, 0);

// Target PID set by userspace — tracepoints filter on this
#[map]
static TARGET_PID: HashMap<u32, u32> = HashMap::with_max_entries(1, 0);

// Store mmap return values keyed by tid
#[map]
static MMAP_SIZES: HashMap<u32, u64> = HashMap::with_max_entries(1024, 0);

// ─── malloc/calloc/realloc uprobes ─────────────────────────────

#[uprobe]
pub fn heaphop_malloc(ctx: ProbeContext) -> u32 {
    let size: u64 = ctx.arg(0).unwrap_or(0);
    let pid_tgid = helpers::bpf_get_current_pid_tgid();
    let tid = (pid_tgid & 0xFFFFFFFF) as u32;
    let _ = ACTIVE_SIZES.insert(&tid, &size, 0);
    0
}

#[uprobe]
pub fn heaphop_calloc(ctx: ProbeContext) -> u32 {
    let nmemb: u64 = ctx.arg(0).unwrap_or(0);
    let size: u64 = ctx.arg(1).unwrap_or(0);
    let total = nmemb * size;
    let pid_tgid = helpers::bpf_get_current_pid_tgid();
    let tid = (pid_tgid & 0xFFFFFFFF) as u32;
    let _ = ACTIVE_SIZES.insert(&tid, &total, 0);
    0
}

#[uprobe]
pub fn heaphop_realloc(ctx: ProbeContext) -> u32 {
    let size: u64 = ctx.arg(1).unwrap_or(0);
    let pid_tgid = helpers::bpf_get_current_pid_tgid();
    let tid = (pid_tgid & 0xFFFFFFFF) as u32;
    let _ = ACTIVE_SIZES.insert(&tid, &size, 0);
    0
}

#[uretprobe]
pub fn heaphop_malloc_ret(ctx: RetProbeContext) -> u32 {
    let pid_tgid = helpers::bpf_get_current_pid_tgid();
    let tid = (pid_tgid & 0xFFFFFFFF) as u32;
    let pid = (pid_tgid >> 32) as u32;

    if let Some(size_ptr) = unsafe { ACTIVE_SIZES.get(&tid) } {
        let size = unsafe { *size_ptr };
        let _ = ACTIVE_SIZES.remove(&tid);

        let address: u64 = ctx.ret().unwrap_or(0);
        if address != 0 {
            let event = AllocationEvent {
                pid,
                tid,
                address,
                size,
                event_type: 0, // malloc/calloc/realloc
                timestamp: unsafe { helpers::bpf_ktime_get_ns() },
            };
            EVENTS.output(&ctx, &event, 0);
        }
    }
    0
}

#[uprobe]
pub fn heaphop_free(ctx: ProbeContext) -> u32 {
    let address: u64 = ctx.arg(0).unwrap_or(0);
    let pid_tgid = helpers::bpf_get_current_pid_tgid();
    let tid = (pid_tgid & 0xFFFFFFFF) as u32;
    let pid = (pid_tgid >> 32) as u32;
    if address != 0 {
        let event = AllocationEvent {
            pid,
            tid,
            address,
            size: 0,
            event_type: 1, // free
            timestamp: unsafe { helpers::bpf_ktime_get_ns() },
        };
        EVENTS.output(&ctx, &event, 0);
    }
    0
}

// ─── mmap/munmap tracepoints ───────────────────────────────────

/// sys_enter_mmap: store the requested length, keyed by tid.
/// Tracepoint args for sys_enter_mmap:
///   __syscall_nr, addr, len, prot, flags, fd, off
#[tracepoint]
pub fn heaphop_mmap_enter(ctx: TracePointContext) -> u32 {
    let pid_tgid = helpers::bpf_get_current_pid_tgid();
    let pid = (pid_tgid >> 32) as u32;

    // Filter: only trace our target PID (single lookup to satisfy verifier)
    let key: u32 = 0;
    let target = match unsafe { TARGET_PID.get(&key) } {
        Some(v) => *v,
        None => return 0,
    };
    if pid != target {
        return 0;
    }

    let tid = (pid_tgid & 0xFFFFFFFF) as u32;
    // arg at offset 24 is `len` (after __syscall_nr(8) + addr(8) + len starts at 24)
    // In tracepoint context, fields are accessed by their byte offset in the args struct
    let len: u64 = unsafe { ctx.read_at(24).unwrap_or(0) };

    if len > 0 {
        let _ = MMAP_SIZES.insert(&tid, &len, 0);
    }
    0
}

/// sys_exit_mmap: read the return value (mapped address) and emit event.
/// Tracepoint args for sys_exit_mmap:
///   __syscall_nr, ret
#[tracepoint]
pub fn heaphop_mmap_exit(ctx: TracePointContext) -> u32 {
    let pid_tgid = helpers::bpf_get_current_pid_tgid();
    let pid = (pid_tgid >> 32) as u32;
    let tid = (pid_tgid & 0xFFFFFFFF) as u32;

    if let Some(size_ptr) = unsafe { MMAP_SIZES.get(&tid) } {
        let size = unsafe { *size_ptr };
        let _ = MMAP_SIZES.remove(&tid);

        // ret is at offset 8 (after __syscall_nr)
        let address: u64 = unsafe { ctx.read_at(8).unwrap_or(0) };

        // MAP_FAILED = (void*)-1 = 0xFFFFFFFFFFFFFFFF
        if address != 0 && address != 0xFFFFFFFFFFFFFFFF {
            let event = AllocationEvent {
                pid,
                tid,
                address,
                size,
                event_type: 2, // mmap
                timestamp: unsafe { helpers::bpf_ktime_get_ns() },
            };
            EVENTS.output(&ctx, &event, 0);
        }
    }
    0
}

/// sys_enter_munmap: emit munmap event immediately (we have addr and len).
/// Tracepoint args for sys_enter_munmap:
///   __syscall_nr, addr, len
#[tracepoint]
pub fn heaphop_munmap(ctx: TracePointContext) -> u32 {
    let pid_tgid = helpers::bpf_get_current_pid_tgid();
    let pid = (pid_tgid >> 32) as u32;

    let key: u32 = 0;
    let target = match unsafe { TARGET_PID.get(&key) } {
        Some(v) => *v,
        None => return 0,
    };
    if pid != target {
        return 0;
    }

    let tid = (pid_tgid & 0xFFFFFFFF) as u32;
    let address: u64 = unsafe { ctx.read_at(8).unwrap_or(0) };
    let size: u64 = unsafe { ctx.read_at(16).unwrap_or(0) };

    if address != 0 {
        let event = AllocationEvent {
            pid,
            tid,
            address,
            size,
            event_type: 3, // munmap
            timestamp: unsafe { helpers::bpf_ktime_get_ns() },
        };
        EVENTS.output(&ctx, &event, 0);
    }
    0
}

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    unsafe { core::hint::unreachable_unchecked() }
}
