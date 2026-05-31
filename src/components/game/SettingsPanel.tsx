'use client';

import { useState, useEffect } from 'react';
import { GameSettings, ALL_CATEGORIES, CATEGORY_LABELS, DURATION_OPTIONS } from '@/types';
import { BeepStyle, BEEP_LABELS, getBeepStyle, saveBeepStyle, playBeep } from '@/lib/sound';

interface SettingsPanelProps {
  settings: GameSettings;
  onChange: (s: GameSettings) => void;
  readonly?: boolean;
}

const BEEP_OPTIONS: BeepStyle[] = ['klasik', 'sert', 'yumusak', 'ince', 'kapali'];

export default function SettingsPanel({ settings, onChange, readonly = false }: SettingsPanelProps) {
  const [beep, setBeep] = useState<BeepStyle>('klasik');
  useEffect(() => { setBeep(getBeepStyle()); }, []);
  function toggleCategory(cat: typeof ALL_CATEGORIES[number]) {
    if (readonly) return;
    const has = settings.categories.includes(cat);
    // En az 1 kategori seçili kalmalı
    if (has && settings.categories.length === 1) return;
    const next = has
      ? settings.categories.filter((c) => c !== cat)
      : [...settings.categories, cat];
    onChange({ ...settings, categories: next });
  }

  function setDuration(d: typeof DURATION_OPTIONS[number]) {
    if (readonly) return;
    onChange({ ...settings, duration: d });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Süre */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Tur Süresi
        </p>
        <div className="grid grid-cols-4 gap-2">
          {DURATION_OPTIONS.map((d) => {
            const active = settings.duration === d;
            return (
              <button
                key={d}
                onClick={() => setDuration(d)}
                disabled={readonly}
                className="rounded-[10px] text-sm font-medium py-2"
                style={{
                  backgroundColor: active ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: active ? 'white' : 'var(--color-text-primary)',
                  border: active ? 'none' : '1px solid var(--color-border)',
                  opacity: readonly ? 0.7 : 1,
                }}
              >
                {d}s
              </button>
            );
          })}
        </div>
      </div>

      {/* Kategoriler */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Kategoriler
        </p>
        <div className="flex flex-col gap-2">
          {ALL_CATEGORIES.map((cat) => {
            const active = settings.categories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                disabled={readonly}
                className="flex items-center justify-between rounded-[10px] px-4 py-3"
                style={{
                  backgroundColor: active ? 'rgba(99,102,241,0.08)' : 'var(--color-surface)',
                  border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  opacity: readonly ? 0.7 : 1,
                }}
              >
                <span className="text-sm font-medium" style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                  {CATEGORY_LABELS[cat]}
                </span>
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: active ? 'var(--color-accent)' : 'var(--color-border)' }}
                >
                  {active && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bip sesi */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Bip Sesi
        </p>
        <div className="grid grid-cols-3 gap-2">
          {BEEP_OPTIONS.map((style) => {
            const active = beep === style;
            return (
              <button
                key={style}
                onClick={() => {
                  setBeep(style);
                  saveBeepStyle(style);
                  if (style !== 'kapali') playBeep(style);
                }}
                className="rounded-[10px] text-sm font-medium py-2"
                style={{
                  backgroundColor: active ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: active ? 'white' : 'var(--color-text-primary)',
                  border: active ? 'none' : '1px solid var(--color-border)',
                }}
              >
                {BEEP_LABELS[style]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
