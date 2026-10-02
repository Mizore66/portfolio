"""Synthesizes the site's four opt-in sound cues. No samples. Run: python3 design/assets/sound/make_sounds.py"""
import numpy as np, wave, subprocess, os
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(64)
HERE = os.path.dirname(os.path.abspath(__file__))

def t(d): return np.arange(int(d * SR)) / SR
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, "lowpass", fs=SR, output="sos"), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, "highpass", fs=SR, output="sos"), x)
def env(n, a, d):  # attack then exponential decay (seconds)
    tt = np.arange(n) / SR; return np.minimum(tt / max(a, 1e-4), 1) * np.exp(-np.maximum(tt - a, 0) / d)
def mode(f, d, dur, ph=0): tt = t(dur); return np.sin(2 * np.pi * f * tt + ph) * np.exp(-tt / d)
def norm(x, peak_db=-3): return x / (np.abs(x).max() + 1e-9) * 10 ** (peak_db / 20)
def fade(x, ms=6): n = int(ms * SR / 1000); x[-n:] *= np.linspace(1, 0, n); return x

def place():
    """A weighted piece set down on a wooden square: felt-damped thunk, a short knock, a hint of board resonance."""
    d = .32; n = int(d * SR); x = np.zeros(n)
    x[:int(.18 * SR)] += .9 * mode(150, .028, .18) + .45 * mode(236, .02, .18, 1)
    for f, dd, a in [(870, .02, .5), (1390, .014, .35), (2210, .009, .22), (3350, .006, .12)]: x[:int(.12 * SR)] += a * mode(f, dd, .12, rng.random() * 6)
    click = hp(rng.standard_normal(int(.004 * SR)), 1800) * env(int(.004 * SR), .0003, .0012); x[:len(click)] += .5 * click
    x += .06 * bp(rng.standard_normal(n), 300, 900) * env(n, .001, .06)
    return fade(norm(lp(x, 7000), -4))

def tick():
    """A mechanical clock tick: a dry high click and a small resonance. Quiet by design."""
    d = .09; n = int(d * SR); x = .25 * bp(rng.standard_normal(n), 1500, 4500) * env(n, .0002, .0018)
    x += .8 * mode(2650, .008, d) + .35 * mode(3900, .005, d, 1.2) + .3 * mode(1180, .012, d)
    return fade(norm(lp(x, 6000), -9))

def seam(dur=1.15):
    """The seam sweeping: felt drawn across a surface. Filtered noise whose band rises and falls with the sweep."""
    n = int(dur * SR); tt = np.arange(n) / SR; noise = rng.standard_normal(n); out = np.zeros(n); blk = 512
    p = tt / dur; centre = 380 + 1100 * np.sin(np.pi * np.clip((p - .05) / .9, 0, 1)) ** 1.5
    for i in range(0, n, blk):  # a band-pass that moves: filter each block at its own centre
        c = centre[i]; seg = noise[max(0, i - 2048):i + blk]; y = bp(seg, c * .55, c * 1.6)
        out[i:i + blk] = y[-len(out[i:i + blk]):]
    shape = np.sin(np.pi * np.clip(p, 0, 1)) ** 1.2 * (0.35 + 0.65 * np.clip(p / .35, 0, 1))
    return fade(norm(lp(out * shape, 3800), -8), 30)

def board_break():
    """The board detonating: a low thump, the crack of wood, then pieces and squares clattering away as they rise."""
    d = 1.9; n = int(d * SR); x = np.zeros(n); tt = np.arange(n) / SR
    f = 62 * np.exp(-tt / .25) + 34; thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .22); x += 1.0 * thump
    crack = bp(rng.standard_normal(int(.09 * SR)), 900, 6000, 1) * env(int(.09 * SR), .0005, .02); x[:len(crack)] += .9 * crack
    air = bp(rng.standard_normal(n), 250, 2500) * env(n, .03, .5); x += .22 * air
    for k in range(46):  # the clatter: small wooden knocks, thinning out and fading as everything flies apart
        at = .02 + (rng.random() ** 1.7) * 1.35; i = int(at * SR); fq = rng.uniform(700, 2600); g = .75 * np.exp(-at / .6) * rng.uniform(.3, 1)
        k1 = g * (mode(fq, rng.uniform(.006, .02), .06) + .5 * mode(fq * 1.6, .006, .06, 1)); x[i:i + len(k1)] += k1[:n - i]
    return fade(norm(lp(x, 9000), -2), 60)

def write(name, x):
    wav = os.path.join(HERE, name + ".wav"); pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(wav, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    m4a = os.path.join(HERE, name + ".m4a")
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "96000", wav, m4a], check=True)
    return os.path.getsize(m4a)

if __name__ == "__main__":
    sizes = {k: write(k, fn()) for k, fn in [("place", place), ("tick", tick), ("seam", seam), ("break", board_break)]}
    for k, v in sizes.items(): print(f"{k:6s} {v / 1024:6.1f} KB")
    print(f"total  {sum(sizes.values()) / 1024:6.1f} KB (budget 500 KB)")
