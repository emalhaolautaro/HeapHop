#![no_std]

/// Event types for allocation tracking
/// 0 = malloc/calloc/realloc allocation
/// 1 = free
/// 2 = mmap
/// 3 = munmap
#[repr(C)]
#[derive(Copy, Clone)]
#[cfg_attr(feature = "user", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "user", serde(rename_all = "camelCase"))]
pub struct AllocationEvent {
    pub pid: u32,
    pub tid: u32,
    pub address: u64,
    pub size: u64,
    pub event_type: u64, // 0=alloc, 1=free, 2=mmap, 3=munmap
    pub timestamp: u64,
}

#[cfg(feature = "user")]
unsafe impl aya::Pod for AllocationEvent {}
