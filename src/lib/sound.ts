let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

/** Kullanıcı etkileşimi sırasında çağır — AudioContext'i önceden uyandırır */
export async function warmUpAudio(): Promise<void> {
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === 'suspended') await ac.resume();
}

async function beep(freq: number, durationMs: number, gain = 0.4): Promise<void> {
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === 'suspended') await ac.resume();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + durationMs / 1000);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + durationMs / 1000);
}

export function playCountdownBeep(second: number): void {
  if (isMuted()) return;
  if (second >= 2) {
    beep(880, 100);  // klasik — 5,4,3,2
  } else {
    beep(1760, 200); // oktav üstü, uzun — 1
  }
}

export function isMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('approxense_muted') === '1';
}

export function setMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('approxense_muted', muted ? '1' : '0');
}
