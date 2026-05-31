'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PLAYER_COLORS, getPlayerColor, savePlayerColor } from '@/lib/utils';

export default function PlayPage() {
  const router = useRouter();
  const [showNickname, setShowNickname] = useState(false);
  const [nickname, setNickname] = useState('');
  const [selectedColor, setSelectedColor] = useState(PLAYER_COLORS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('approxense_display_name');
      if (saved && !saved.startsWith('Misafir')) setNickname(saved);
      setSelectedColor(getPlayerColor());
    }
  }, []);

  useEffect(() => {
    if (showNickname) setTimeout(() => inputRef.current?.focus(), 50);
  }, [showNickname]);

  function handleStart() {
    const trimmed = nickname.trim();
    if (trimmed) localStorage.setItem('approxense_display_name', trimmed);
    savePlayerColor(selectedColor);
    router.push('/room/new');
  }

  if (showNickname) {
    return (
      <div className="h-full flex flex-col justify-center px-5 gap-5" style={{ backgroundColor: 'var(--color-bg)' }}>
        <button
          onClick={() => setShowNickname(false)}
          className="self-start text-sm px-2 py-1 rounded-lg"
          style={{ color: 'var(--color-text-muted)' }}
        >
          ← Geri
        </button>

        <div>
          <h2 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Takma Ad
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Diğer oyuncular seni böyle görecek
          </p>
        </div>

        {/* Input + renk kutusu yan yana */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="Takma adın (isteğe bağlı)"
            maxLength={20}
            className="flex-1 rounded-[12px] border px-4 text-base outline-none"
            style={{
              height: '52px',
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          {/* Renk kutusu — tıklanınca picker açılır */}
          <button
            onClick={() => {
              const idx = PLAYER_COLORS.indexOf(selectedColor);
              const next = PLAYER_COLORS[(idx + 1) % PLAYER_COLORS.length];
              setSelectedColor(next);
            }}
            className="rounded-[12px] border flex-shrink-0 relative"
            style={{
              width: '52px',
              height: '52px',
              backgroundColor: selectedColor,
              borderColor: 'transparent',
              boxShadow: `0 0 0 3px var(--color-bg), 0 0 0 5px ${selectedColor}`,
            }}
            title="Renk seç"
          />
        </div>

        {/* Renk paleti */}
        <div className="flex flex-wrap gap-3">
          {PLAYER_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className="rounded-full transition-transform"
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: color,
                outline: selectedColor === color ? `3px solid ${color}` : 'none',
                outlineOffset: '2px',
                transform: selectedColor === color ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Önizleme */}
        <div
          className="rounded-[12px] border px-4 py-3 flex items-center gap-2"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Önizleme:</span>
          <span className="text-sm font-bold" style={{ color: selectedColor }}>
            {nickname.trim() || 'Takma Adın'}
          </span>
        </div>

        <button
          onClick={handleStart}
          className="w-full rounded-[12px] text-base font-medium"
          style={{ height: '52px', backgroundColor: 'var(--color-accent)', color: 'white' }}
        >
          Odaya Gir
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-center px-5 gap-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <h2 className="text-2xl font-semibold text-center mb-4" style={{ color: 'var(--color-text-primary)' }}>
        Mod Seç
      </h2>

      <Link href="/game" className="w-full block rounded-[16px] border p-6 text-left"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <p className="text-lg font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Tek Oyuncu
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Kendi başına oyna, skorunu gör
        </p>
      </Link>

      <button
        onClick={() => setShowNickname(true)}
        className="w-full rounded-[16px] border p-6 text-left"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <p className="text-lg font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Çok Oyunculu
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Oda oluştur, arkadaşlarınla rekabet et
        </p>
      </button>
    </div>
  );
}
