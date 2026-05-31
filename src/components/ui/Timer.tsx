'use client';

import { useEffect, useRef, useState } from 'react';
import { playCountdownBeep } from '@/lib/sound';

interface TimerProps {
  duration: number;
  onExpire: () => void;
  paused?: boolean;
  /** inline: Keypad içinde kullanım için timeLeft'i dışarı ilet */
  onTick?: (timeLeft: number) => void;
}

export default function Timer({ duration, onExpire, paused = false, onTick }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => { setTimeLeft(duration); }, [duration]);

  useEffect(() => {
    onTick?.(timeLeft);
    if (timeLeft > 0 && timeLeft <= 5) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(timeLeft === 1 ? [80, 40, 80] : 40);
      }
      playCountdownBeep(timeLeft);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (paused) return;
    if (timeLeft <= 0) { onExpireRef.current(); return; }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, paused]);

  const isUrgent = timeLeft <= 5;

  return (
    <div
      className="font-mono font-semibold tabular-nums"
      style={{
        fontSize: isUrgent ? '2rem' : '1.5rem',
        color: isUrgent ? 'var(--color-danger)' : 'var(--color-text-primary)',
        transition: 'font-size 0.15s, color 0.15s',
      }}
      aria-label={`${timeLeft} saniye kaldı`}
    >
      {timeLeft}
    </div>
  );
}
