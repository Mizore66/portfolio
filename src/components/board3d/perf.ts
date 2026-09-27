/** Set during a frame by anything that is animating, so the quality governor counts only animation frames. */
let flag = false;

export function markAnimating(): void {
  flag = true;
}

export function takeAnimating(): boolean {
  const f = flag;
  flag = false;
  return f;
}
