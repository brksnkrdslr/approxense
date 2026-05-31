'use client';

import { useState, useEffect } from 'react';
import { isMuted, setMuted } from '@/lib/sound';

interface KeypadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  // Hazır butonu
  onSubmitReady?: () => void;
  submitReady?: boolean;
  submitReadyCount?: number;
  totalPlayers?: number;
  // Timer (Hazır butonunun solunda gösterilir)
  timeLeft?: number;
}

const KEYS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['.000', '0', '⌫'],
];

function BackspaceIcon() {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="currentColor">
      <path d="M9 0L0 9l9 9h13V0H9zm11 16H9.83L2.42 9l7.41-7H20v14zm-7.59-11L9 7.41 10.59 9 9 10.59 10.41 12 12 10.41 13.59 12 15 10.59 13.41 9 15 7.41z"/>
    </svg>
  );
}

export default function Keypad({
  value,
  onChange,
  disabled = false,
  onSubmitReady,
  submitReady = false,
  submitReadyCount,
  totalPlayers,
  timeLeft,
}: KeypadProps) {
  function handleKey(key: string) {
    if (disabled) return;

    if (key === '⌫') {
      onChange(value.slice(0, -1));
      return;
    }

    if (key === '.000') {
      if (value === '' || value === '0') return;
      const next = value + '000';
      if (next.length > 15) return;
      onChange(next);
      return;
    }

    if (key === '0' && value === '') return;

    const next = value + key;
    if (next.length > 15) return;
    onChange(next);
  }

  const showHazir = !!onSubmitReady;
  const isMulti = totalPlayers !== undefined && totalPlayers > 1;
  const readyLabel = isMulti
    ? submitReady
      ? `⏳ ${submitReadyCount ?? 1}/${totalPlayers}`
      : 'Hazır'
    : submitReady
      ? '⏳'
      : 'Hazır';

  const isUrgent = timeLeft !== undefined && timeLeft <= 5;
  const [muted, setMutedState] = useState(false);
  useEffect(() => { setMutedState(isMuted()); }, []);

  function toggleMute() {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  }

  return (
    <div
      className="absolute bottom-0 left-0 right-0 w-full"
      style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}
    >
      {showHazir && (
        <div className="relative flex items-center justify-end px-3 pt-3" style={{ minHeight: '68px' }}>
          {/* Geri sayım — ekranın tam ortasında, absolute */}
          <div
            className="absolute inset-x-0 flex items-center justify-center pointer-events-none font-mono font-bold tabular-nums"
            style={{
              fontSize: isUrgent ? '3rem' : '2.25rem',
              color: isUrgent ? 'var(--color-danger)' : 'var(--color-text-primary)',
              transition: 'font-size 0.15s ease, color 0.15s ease',
              lineHeight: 1,
            }}
          >
            {timeLeft ?? ''}
          </div>
          {/* Hazır butonu — sağda, 1 key genişliğinde */}
          <button
            onClick={onSubmitReady}
            className="relative rounded-[10px] text-base font-medium transition-colors"
            style={{
              width: 'calc((100% - 16px) / 3)',
              height: '64px',
              backgroundColor: submitReady ? 'var(--color-surface-alt)' : 'var(--color-accent)',
              color: submitReady ? 'var(--color-text-secondary)' : 'white',
              border: submitReady ? '1px solid var(--color-border)' : 'none',
            }}
          >
            {readyLabel}
          </button>
        </div>
      )}

      <div className="p-3 grid grid-rows-4 gap-2">
        {KEYS.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 gap-2">
            {row.map((key, ci) => (
              <div key={key} className="relative">
                {/* Hoparlör ikonu — sadece "6" tuşunun üzerinde */}
                {ri === 1 && ci === 2 && (
                  <button
                    onClick={toggleMute}
                    className="absolute -top-2 right-1 z-10 flex items-center justify-center"
                    style={{ width: '18px', height: '18px' }}
                    aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
                  >
                    {muted ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}>
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <line x1="23" y1="9" x2="17" y2="15"/>
                        <line x1="17" y1="9" x2="23" y2="15"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}>
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      </svg>
                    )}
                  </button>
                )}
              <button
                aria-label={key}
                disabled={disabled}
                onClick={() => handleKey(key)}
                className="rounded-[10px] border font-mono font-medium transition-colors active:scale-95 disabled:opacity-40 flex items-center justify-center"
                style={{
                  minHeight: '64px',
                  fontSize: '1.25rem',
                  backgroundColor: key === '⌫' ? 'rgba(239,68,68,0.08)' : 'var(--color-surface)',
                  borderColor: key === '⌫' ? 'rgba(239,68,68,0.25)' : 'var(--color-border)',
                  color: key === '⌫' ? 'var(--color-danger)' : 'var(--color-text-primary)',
                }}
              >
                {key === '⌫' ? <BackspaceIcon /> : key}
              </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
