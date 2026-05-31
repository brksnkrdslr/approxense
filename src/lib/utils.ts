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
