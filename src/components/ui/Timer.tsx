'use client';

import { useEffect, useRef, useState } from 'react';

interface TimerProps {
  duration: number;
  onExpire: () => void;
  paused?: boolean;
}

export default function Timer({ duration, onExpire, paused = false }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (paused) return;
    if (timeLeft <= 0) {
      onExpireRef.current();
      return;
    }

    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, paused]);

  const isUrgent = timeLeft <= 3;

  return (
    <div
      className="text-3xl font-mono font-medium tabular-nums w-10 text-right"
      style={{ color: isUrgent ? 'var(--color-danger)' : 'var(--color-text-primary)' }}
      aria-label={`${timeLeft} saniye kaldı`}
    >
      {timeLeft}
    </div>
  );
}
