'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { savePlayerHue } from '@/lib/utils';

const PRESET_COLORS = [
  { hue: 0,   hex: '#EF4444', label: 'Kırmızı' },
  { hue: 20,  hex: '#F97316', label: 'Turuncu' },
  { hue: 45,  hex: '#F59E0B', label: 'Amber' },
  { hue: 84,  hex: '#84CC16', label: 'Yeşil-Sarı' },
  { hue: 142, hex: '#22C55E', label: 'Yeşil' },
  { hue: 172, hex: '#14B8A6', label: 'Teal' },
  { hue: 200, hex: '#0EA5E9', label: 'Mavi' },
  { hue: 231, hex: '#6366F1', label: 'İndigo' },
  { hue: 262, hex: '#A855F7', label: 'Mor' },
  { hue: 291, hex: '#D946EF', label: 'Fuşya' },
  { hue: 330, hex: '#F43F5E', label: 'Gül' },
  { hue: 0,   hex: '#78716C', label: 'Taş' },
];

const PLACEHOLDER_NAMES = ['Harika', 'Keskin', 'Meraklı', 'Akıllı'];

export default function PlayPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[7]); // indigo default
  const [placeholder, setPlaceholder] = useState(PLACEHOLDER_NAMES[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('approxense_display_name');
      if (saved && !saved.startsWith('Misafir')) setNickname(saved);

      const savedHue = localStorage.getItem('approxense_player_hue');
      if (savedHue) {
        const hue = Number(savedHue);
        const match = PRESET_COLORS.find(c => Math.abs(c.hue - hue) < 20);
        if (match) setSelectedColor(match);
      }
    }
    const idx = Math.floor(Math.random() * PLACEHOLDER_NAMES.length);
    setPlaceholder(PLACEHOLDER_NAMES[idx]);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  async function handlePlay() {
    const trimmed = nickname.trim();
    if (trimmed) localStorage.setItem('approxense_display_name', trimmed);
    savePlayerHue(selectedColor.hue);
    router.push('/room/new');
  }

  const displayName = nickname.trim() || placeholder;

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Üst başlık */}
      <div className="flex items-center px-5 pt-5 pb-2">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-sm cursor-pointer min-h-[44px] px-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Geri
        </button>
      </div>

      {/* Avatar + isim önizleme */}
      <div className="flex flex-col items-center pt-6 pb-8 px-5 animate-fade-up">
        {/* Avatar dairesi */}
        <div
          className="rounded-full flex items-center justify-center mb-4 font-bold text-white select-none"
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: selectedColor.hex,
            fontSize: '2rem',
            boxShadow: `0 8px 24px ${selectedColor.hex}50`,
            transition: 'background-color 0.25s, box-shadow 0.25s',
            letterSpacing: '-0.02em',
          }}
        >
          {displayName.slice(0, 1).toUpperCase()}
        </div>

        <p
          className="text-xl font-semibold tracking-tight"
          style={{
            color: selectedColor.hex,
            transition: 'color 0.25s',
            letterSpacing: '-0.02em',
          }}
        >
          {displayName}
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Diğer oyuncular seni böyle görecek
        </p>
      </div>

      {/* İsim input */}
      <div className="px-5 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.12em' }}>
          Takma Ad
        </label>
        <input
          ref={inputRef}
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.blur()}
          placeholder={placeholder}
          maxLength={20}
          className="w-full rounded-2xl border px-4 text-base font-semibold outline-none"
          style={{
            height: '52px',
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
            caretColor: selectedColor.hex,
            transition: 'border-color 0.2s',
            letterSpacing: '-0.01em',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = selectedColor.hex)}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        />
      </div>

      {/* Renk seçimi */}
      <div className="px-5 mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.12em' }}>
          Renk
        </label>
        <div className="grid grid-cols-6 gap-3">
          {PRESET_COLORS.map((color) => {
            const isSelected = selectedColor.hex === color.hex;
            return (
              <button
                key={color.hex + color.label}
                aria-label={color.label}
                onClick={() => setSelectedColor(color)}
                className="rounded-full cursor-pointer flex items-center justify-center"
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  backgroundColor: color.hex,
                  boxShadow: isSelected ? `0 0 0 3px var(--color-bg), 0 0 0 5px ${color.hex}` : 'none',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s',
                }}
              >
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 mt-auto pb-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <button
          onClick={handlePlay}
          className="w-full rounded-2xl text-base font-semibold text-white cursor-pointer active:scale-95"
          style={{
            height: '54px',
            backgroundColor: selectedColor.hex,
            boxShadow: `0 4px 20px ${selectedColor.hex}40`,
            transition: 'background-color 0.25s, box-shadow 0.25s, transform 0.1s',
            letterSpacing: '-0.01em',
          }}
        >
          Oyna
        </button>
      </div>
    </div>
  );
}
