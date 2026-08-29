/* OPN2 integer forward pass. Matches src/lib/chess/nnue/infer.ts.
 * Built to wasm32 for the site worker and the Node match harness.
 */
#include <stdint.h>
#include <stddef.h>

#define QA 255
#define QB 64
#define CRELU_MAX 127
#define INPUT 768
#define HIDDEN 32
#define HEAP_SIZE (3 * 1024 * 1024)

static uint8_t heap[HEAP_SIZE];
static uint32_t bump = 0;

static int acc_size = 0;
static int scale = 400;
static const int16_t *ft_w;
static const int16_t *ft_b;
static const int8_t *l1_w;
static const int32_t *l1_b;
static const int8_t *l2_w;
static int32_t l2_b;

static uint32_t u16le(const uint8_t *p) { return p[0] | (p[1] << 8); }
static int32_t i32le(const uint8_t *p) {
  return (int32_t)(p[0] | (p[1] << 8) | (p[2] << 16) | ((uint32_t)p[3] << 24));
}

__attribute__((export_name("heap_ptr")))
uint32_t nnue_heap_ptr(void) {
  return (uint32_t)(uintptr_t)heap;
}

__attribute__((export_name("heap_size")))
uint32_t nnue_heap_size(void) {
  return HEAP_SIZE;
}

__attribute__((export_name("nnue_load")))
int32_t nnue_load(uint32_t off, uint32_t len) {
  if (off + len > HEAP_SIZE) return -1;
  const uint8_t *bytes = heap + off;
  if (len < 16) return -2;
  if (bytes[0] != 'O' || bytes[1] != 'P' || bytes[2] != 'N' || bytes[3] != '2') return -3;
  if (u16le(bytes + 4) != 1) return -4;
  uint8_t arch = bytes[6];
  acc_size = arch == 2 ? 128 : 256;
  if (arch != 1 && arch != 2) return -5;
  scale = i32le(bytes + 7);
  uint32_t id_len = u16le(bytes + 11);
  uint32_t o = 13 + id_len;
  uint32_t ft_w_n = (uint32_t)acc_size * INPUT;
  uint32_t ft_b_n = (uint32_t)acc_size;
  uint32_t l1_n = (uint32_t)HIDDEN * 2 * (uint32_t)acc_size;
  if (o + ft_w_n * 2 + ft_b_n * 2 + l1_n + HIDDEN * 4 + HIDDEN + 4 != len) return -6;
  ft_w = (const int16_t *)(bytes + o);
  o += ft_w_n * 2;
  ft_b = (const int16_t *)(bytes + o);
  o += ft_b_n * 2;
  l1_w = (const int8_t *)(bytes + o);
  o += l1_n;
  l1_b = (const int32_t *)(bytes + o);
  o += HIDDEN * 4;
  l2_w = (const int8_t *)(bytes + o);
  o += HIDDEN;
  l2_b = i32le(bytes + o);
  (void)ft_w;
  (void)ft_b;
  return acc_size;
}

__attribute__((export_name("nnue_eval")))
int32_t nnue_eval(uint32_t stm_off, uint32_t nstm_off, int32_t side) {
  if (!l1_w || stm_off + (uint32_t)acc_size * 2 > HEAP_SIZE) return 0;
  const int16_t *stm = (const int16_t *)(heap + stm_off);
  const int16_t *nstm = (const int16_t *)(heap + nstm_off);
  int32_t hidden[HIDDEN];
  int n = acc_size;
  for (int i = 0; i < HIDDEN; i++) {
    int32_t s = l1_b[i];
    int row = i * (2 * n);
    for (int j = 0; j < n; j++) {
      int a = stm[j];
      if (a > 0) s += (a > CRELU_MAX ? CRELU_MAX : a) * l1_w[row + j];
    }
    for (int j = 0; j < n; j++) {
      int a = nstm[j];
      if (a > 0) s += (a > CRELU_MAX ? CRELU_MAX : a) * l1_w[row + n + j];
    }
    hidden[i] = s;
  }
  int32_t out = l2_b;
  for (int i = 0; i < HIDDEN; i++) {
    int h = hidden[i] / QA;
    if (h > 0) out += (h > CRELU_MAX ? CRELU_MAX : h) * l2_w[i];
  }
  int32_t cp = (out * scale) / (QA * QB);
  return side == 1 ? cp : -cp;
}

/* Unused: keep a bump in the module so the heap is not stripped. */
__attribute__((export_name("nnue_bump_reset")))
void nnue_bump_reset(void) {
  bump = 0;
}
