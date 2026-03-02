use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
    let mut arr: Vec<Box<i32>> = Vec::with_capacity(100);
    
    // Simple PRNG
    let seed = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos();
    let mut current_rand = seed as u32;

    // Allocate 100 individual boxed ints
    for _ in 0..100 {
        current_rand = current_rand.wrapping_mul(1103515245).wrapping_add(12345);
        arr.push(Box::new((current_rand / 65536) as i32));
    }

    // Free half of them
    arr.truncate(50);
}
