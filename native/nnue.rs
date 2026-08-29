#![no_std]
#![no_main]

const QA: i32 = 255;
const QB: i32 = 64;
const CRELU_MAX: i32 = 127;
const INPUT: usize = 768;
const HIDDEN: usize = 32;
const HEAP_SIZE: usize = 3 * 1024 * 1024;

#[repr(align(4))]
struct Heap([u8; HEAP_SIZE]);

static mut HEAP: Heap = Heap([0; HEAP_SIZE]);
static mut ACC: i32 = 0;
static mut SCALE: i32 = 400;
static mut FT_W: usize = 0;
static mut FT_B: usize = 0;
static mut L1_W: usize = 0;
static mut L1_B: usize = 0;
static mut L2_W: usize = 0;
static mut L2_B: i32 = 0;
static mut LOADED: bool = false;

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}

fn u16le(bytes: &[u8], o: usize) -> u32 {
    bytes[o] as u32 | ((bytes[o + 1] as u32) << 8)
}

fn i32le(bytes: &[u8], o: usize) -> i32 {
    bytes[o] as i32
        | ((bytes[o + 1] as i32) << 8)
        | ((bytes[o + 2] as i32) << 16)
        | ((bytes[o + 3] as i32) << 24)
}

unsafe fn heap() -> &'static mut [u8] {
    &mut HEAP.0
}

#[no_mangle]
pub extern "C" fn heap_ptr() -> u32 {
    unsafe { HEAP.0.as_ptr() as u32 }
}

#[no_mangle]
pub extern "C" fn heap_size() -> u32 {
    HEAP_SIZE as u32
}

#[no_mangle]
pub extern "C" fn nnue_load(off: u32, len: u32) -> i32 {
    let off = off as usize;
    let len = len as usize;
    if off + len > HEAP_SIZE {
        return -1;
    }
    let bytes = unsafe { &HEAP.0[off..off + len] };
    if len < 16 {
        return -2;
    }
    if bytes[0] != b'O' || bytes[1] != b'P' || bytes[2] != b'N' || bytes[3] != b'2' {
        return -3;
    }
    if u16le(bytes, 4) != 1 {
        return -4;
    }
    let acc = if bytes[6] == 2 { 128 } else { 256 };
    if bytes[6] != 1 && bytes[6] != 2 {
        return -5;
    }
    let scale = i32le(bytes, 7);
    let id_len = u16le(bytes, 11) as usize;
    let mut o = 13 + id_len;
    let ft_w_n = acc * INPUT;
    let ft_b_n = acc;
    let l1_n = HIDDEN * 2 * acc;
    let need = o + ft_w_n * 2 + ft_b_n * 2 + l1_n + HIDDEN * 4 + HIDDEN + 4;
    if need != len {
        return -6;
    }
    unsafe {
        ACC = acc as i32;
        SCALE = scale;
        FT_W = off + o;
        o += ft_w_n * 2;
        FT_B = off + o;
        o += ft_b_n * 2;
        L1_W = off + o;
        o += l1_n;
        L1_B = off + o;
        o += HIDDEN * 4;
        L2_W = off + o;
        o += HIDDEN;
        L2_B = i32le(bytes, o);
        LOADED = true;
        let _ = (FT_W, FT_B);
    }
    acc as i32
}

fn i16_at(base: usize, idx: usize) -> i32 {
    let o = base + idx * 2;
    let b = unsafe { &HEAP.0 };
    (b[o] as i16 | ((b[o + 1] as i16) << 8)) as i32
}

fn i8_at(base: usize, idx: usize) -> i32 {
    unsafe { HEAP.0[base + idx] as i8 as i32 }
}

fn i32_at(base: usize, idx: usize) -> i32 {
    i32le(unsafe { &HEAP.0 }, base + idx * 4)
}

#[no_mangle]
pub extern "C" fn nnue_eval(stm_off: u32, nstm_off: u32, side: i32) -> i32 {
    if unsafe { !LOADED } {
        return 0;
    }
    let n = unsafe { ACC } as usize;
    let stm = stm_off as usize;
    let nstm = nstm_off as usize;
    if stm + n * 2 > HEAP_SIZE || nstm + n * 2 > HEAP_SIZE {
        return 0;
    }
    let l1 = unsafe { L1_W };
    let l1b = unsafe { L1_B };
    let l2 = unsafe { L2_W };
    let mut hidden = [0i32; HIDDEN];
    for i in 0..HIDDEN {
        let mut s = i32_at(l1b, i);
        let row = i * (2 * n);
        for j in 0..n {
            let a = i16_at(stm, j);
            if a > 0 {
                s += (if a > CRELU_MAX { CRELU_MAX } else { a }) * i8_at(l1, row + j);
            }
        }
        for j in 0..n {
            let a = i16_at(nstm, j);
            if a > 0 {
                s += (if a > CRELU_MAX { CRELU_MAX } else { a }) * i8_at(l1, row + n + j);
            }
        }
        hidden[i] = s;
    }
    let mut out = unsafe { L2_B };
    for i in 0..HIDDEN {
        let mut h = hidden[i] / QA;
        if h > 0 {
            if h > CRELU_MAX {
                h = CRELU_MAX;
            }
            out += h * i8_at(l2, i);
        }
    }
    let cp = (out * unsafe { SCALE }) / (QA * QB);
    if side == 1 { cp } else { -cp }
}

#[no_mangle]
pub extern "C" fn nnue_acc_size() -> i32 {
    unsafe { ACC }
}
