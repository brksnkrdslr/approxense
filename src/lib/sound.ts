export type BeepStyle = 'klasik' | 'sert' | 'yumusak' | 'ince' | 'kapali';

export const BEEP_LABELS: Record<BeepStyle, string> = {
  klasik: 'Klasik',
  sert: 'Sert',
  yumusak: 'Yumuşak',
  ince: 'İnce',
  kapali: 'Kapalı',
};

interface BeepConfig {
  freq: number;
  type: OscillatorType;
  duration: number; // ms
  gain: number;     // 0-1
}

const BEEP_CONFIGS: Record<Exclude<BeepStyle, 'kapali'>, BeepConfig> = {
  klasik: { freq: 880,  type: 'sine',     duration: 100, gain: 0.4 },
  sert:   { freq: 1200, type: 'square',   duration: 80,  gain: 0.3 },
  yumusak:{ freq: 440,  type: 'sine',     duration: 160, gain: 0.35 },
  ince:   { freq: 1800, type: 'triangle', duration: 60,  gain: 0.45 },
};

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function playBeep(style: BeepStyle): void {
  if (style === 'kapali') return;
  const ac = getCtx();
  if (!ac) return;

  const cfg = BEEP_CONFIGS[style];
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = cfg.type;
  osc.frequency.value = cfg.freq;
  gain.gain.setValueAtTime(cfg.gain, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + cfg.duration / 1000);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + cfg.duration / 1000);
}

export function getBeepStyle(): BeepStyle {
  if (typeof window === 'undefined') return 'klasik';
  return (localStorage.getItem('approxense_beep') as BeepStyle) ?? 'klasik';
}

export function saveBeepStyle(style: BeepStyle): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('approxense_beep', style);
}
