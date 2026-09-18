/** Deterministic PRNG so the seed is identical on every machine. */
export function rng(seed = 7) {
  let s = seed >>> 0;
  const next = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  return { next, int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)), pick: <T>(arr: readonly T[]) => arr[Math.floor(next() * arr.length)] };
}
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const iso = (d: Date) => d.toISOString();
