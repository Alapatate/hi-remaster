function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Shift each RGB channel of a hex color. Negative values darken, positive lighten. */
export function shadeColor(hex: string, amount: number): string {
  const raw = hex.replace('#', '');
  const normalized =
    raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw.slice(0, 6);
  const num = parseInt(normalized, 16);

  const r = clamp((num >> 16) + amount, 0, 255);
  const g = clamp(((num >> 8) & 0xff) + amount, 0, 255);
  const b = clamp((num & 0xff) + amount, 0, 255);

  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
