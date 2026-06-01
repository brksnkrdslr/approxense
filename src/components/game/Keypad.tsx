'use client';

import { useState, useEffect } from 'react';
import { isMuted, setMuted, warmUpAudio } from '@/lib/sound';

interface KeypadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onSubmitReady?: () => void;
  submitReady?: boolean;
  submitReadyCount?: number;
  totalPlayers?: number;
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
    <svg width="20" height="16" viewBox="0 0 22 18" fill="currentColor">
      <path d="M9 0L0 9l9 9h13V0H9zm11 16H9.83L2.42 9l7.41-7H20v14zm-7.59-11L9 7.41 10.59 9 9 10.59 10.41 12 12 10.41 13.59 12 15 10.59 13.41 9 15 7.41z"/>
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
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
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [muted, setMutedState] = useState(false);
  useEffect(() => { setMutedState(isMuted()); }, []);

  function handleKey(key: string) {
    if (disabled) return;
    warmUpAudio();
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 120);

    if (key === '⌫') { onChange(value.slice(0, -1)); return; }
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

  function toggleMute() {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  }

  const showHazir = !!onSubmitReady;
  const isMulti = totalPlayers !== undefined && totalPlayers > 1;
  const readyLabel = isMulti
    ? submitReady ? `⏳ ${submitReadyCount ?? 1}/${totalPlayers}` : 'Hazır'
    : submitReady ? '⏳' : 'Hazır';

  const isUrgent = timeLeft !== undefined && timeLeft <= 5;
  const keyWidth = 'calc((100% - 16px) / 3)';

  return (
    <div
      className="absolute bottom-0 left-0 right-0 w-full"
      onPointerDown={() => warmUpAudio()}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: `2px solid ${isUrgent ? 'rgba(239,68,68,0.4)' : 'var(--color-border)'}`,
        transition: 'border-color 0.3s',
        animation: isUrgent ? 'timer-urgent-pulse 0.8s ease-in-out infinite' : 'none',
      }}
    >
      {showHazir && (
        <div
          className="relative flex items-center justify-between px-3 pt-3"
          style={{ minHeight: '68px' }}
        >
          {/* Hoparlör */}
          <button
            onClick={toggleMute}
            className="relative rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer"
            style={{
              width: keyWidth,
              height: '60px',
              backgroundColor: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              color: muted ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
              opacity: muted ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}
            aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
          >
            <SpeakerIcon muted={muted} />
          </button>

          {/* Timer — ortada */}
          <div
            className="absolute inset-x-0 flex items-center justify-center pointer-events-none font-mono font-bold tabular-nums"
            style={{
              fontSize: isUrgent ? '3.2rem' : '2.4rem',
              color: isUrgent ? 'var(--color-danger)' : 'var(--color-text-primary)',
              transition: 'font-size 0.2s cubic-bezier(0.22,1,0.36,1), color 0.2s',
              lineHeight: 1,
              transform: isUrgent ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {timeLeft ?? ''}
          </div>

          {/* Hazır */}
          <button
            onClick={onSubmitReady}
            className="relative rounded-xl text-base font-semibold flex-shrink-0 cursor-pointer"
            style={{
              width: keyWidth,
              height: '60px',
              backgroundColor: submitReady ? 'var(--color-surface-alt)' : 'var(--color-accent)',
              color: submitReady ? 'var(--color-text-secondary)' : 'white',
              border: submitReady ? '1px solid var(--color-border)' : 'none',
              transition: 'background-color 0.15s, transform 0.1s',
              letterSpacing: '-0.01em',
            }}
          >
            {readyLabel}
          </button>
        </div>
      )}

      <div className="p-3 grid grid-rows-4 gap-2">
        {KEYS.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 gap-2">
            {row.map((key) => {
              const isPressed = pressedKey === key;
              const isBackspace = key === '⌫';
              const isThousand = key === '.000';
              return (
                <button
                  key={key}
                  aria-label={key}
                  disabled={disabled}
                  onClick={() => handleKey(key)}
                  className="rounded-xl border font-mono font-semibold disabled:opacity-40 flex items-center justify-center cursor-pointer select-none"
                  style={{
                    minHeight: '60px',
                    fontSize: isThousand ? '0.85rem' : '1.3rem',
                    backgroundColor: isBackspace
                      ? isPressed ? 'rgba(239,68,68,0.16)' : 'rgba(239,68,68,0.06)'
                      : isPressed
                      ? 'var(--color-surface-alt)'
                      : 'var(--color-surface)',
                    borderColor: isBackspace
                      ? 'rgba(239,68,68,0.2)'
                      : isPressed
                      ? 'var(--color-accent)'
                      : 'var(--color-border)',
                    color: isBackspace ? 'var(--color-danger)' : 'var(--color-text-primary)',
                    transform: isPressed ? 'scale(0.92)' : 'scale(1)',
                    transition: 'transform 0.12s cubic-bezier(0.22,1,0.36,1), background-color 0.12s, border-color 0.12s',
                    fontWeight: 600,
                  }}
                >
                  {key === '⌫' ? <BackspaceIcon /> : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
