function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateDisplayName(): string {
  if (typeof window === 'undefined') return 'Misafir';
  const saved = localStorage.getItem('approxense_display_name');
  if (saved) return saved;
  const num = Math.floor(1000 + Math.random() * 9000);
  const name = `Misafir${num}`;
  localStorage.setItem('approxense_display_name', name);
  return name;
}

export function saveDisplayName(name: string): void {
  if (typeof window === 'undefined') return;
  if (name.trim()) localStorage.setItem('approxense_display_name', name.trim());
}

export const PLAYER_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6',
];

export function hueToColor(hue: number): string {
  // HSL → hex: saturation 90%, lightness 55% — canlı ama göze batmayan
  const s = 0.9, l = 0.55;
  const h = hue / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const toC = (t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const r = Math.round(toC(h + 1/3) * 255);
  const g = Math.round(toC(h) * 255);
  const b = Math.round(toC(h - 1/3) * 255);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

export function getPlayerColor(): string {
  if (typeof window === 'undefined') return hueToColor(240);
  const hue = localStorage.getItem('approxense_player_hue');
  return hue ? hueToColor(Number(hue)) : hueToColor(240);
}

export function getPlayerHue(): number {
  if (typeof window === 'undefined') return 240;
  return Number(localStorage.getItem('approxense_player_hue') ?? 240);
}

export function savePlayerColor(color: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('approxense_player_color', color);
}

export function savePlayerHue(hue: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('approxense_player_hue', String(hue));
  localStorage.setItem('approxense_player_color', hueToColor(hue));
}

export function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('approxense_player_id');
  if (!id) {
    id = generateUUID();
    localStorage.setItem('approxense_player_id', id);
  }
  return id;
}

export function formatScore(score: number): string {
  return score.toFixed(2);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Büyük sayıları kısa Türkçe formatla gösterir: 60.000.000.000 → "60 mlyr" */
export function shortNumber(n: number | null): string {
  if (n === null) return '—';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000_000) return `${+(abs / 1_000_000_000_000).toPrecision(3)} try`;
  if (abs >= 1_000_000_000)     return `${+(abs / 1_000_000_000).toPrecision(3)} mlyr`;
  if (abs >= 1_000_000)         return `${+(abs / 1_000_000).toPrecision(3)} mln`;
  if (abs >= 10_000)            return `${+(abs / 1_000).toPrecision(3)}k`;
  return n.toLocaleString('tr-TR');
}

export function numberToTurkish(n: number): string {
  if (!n || n <= 0) return '';
  const units: [number, string][] = [
    [1_000_000_000_000, 'trilyon'],
    [1_000_000_000, 'milyar'],
    [1_000_000, 'milyon'],
    [1_000, 'bin'],
  ];
  const parts: string[] = [];
  let rem = Math.floor(n);
  for (const [val, label] of units) {
    if (rem >= val) {
      parts.push(`${Math.floor(rem / val)} ${label}`);
      rem %= val;
    }
  }
  if (rem > 0) parts.push(`${rem}`);
  return parts.join(' ');
}
