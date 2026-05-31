'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerHue, hueToColor, savePlayerHue } from '@/lib/utils';

export default function PlayPage() {
  const router = useRouter();
  const [showNickname, setShowNickname] = useState(false);
  const [nickname, setNickname] = useState('');
  const [hue, setHue] = useState(240);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('approxense_display_name');
      if (saved && !saved.startsWith('Misafir')) setNickname(saved);
      setHue(getPlayerHue());
    }
  }, []);

  useEffect(() => {
    if (showNickname) setTimeout(() => inputRef.current?.focus(), 50);
  }, [showNickname]);

  const color = hueToColor(hue);

  function handleStart() {
    const trimmed = nickname.trim();
    if (trimmed) localStorage.setItem('approxense_display_name', trimmed);
    savePlayerHue(hue);
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

        {/* Input — arka fon yok, yazı ortada, renk realtime */}
        <input
          ref={inputRef}
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          placeholder="Takma adın"
          maxLength={20}
          className="w-full text-center text-2xl font-bold outline-none bg-transparent border-none"
          style={{ color: color }}
        />

        {/* Hue slider — isimden boşluk */}
        <div className="mt-6">
          <input
            type="range"
            min={0}
            max={359}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="w-full h-3 rounded-full cursor-pointer appearance-none"
            style={{
              background: 'linear-gradient(to right, hsl(0,90%,55%), hsl(30,90%,55%), hsl(60,90%,55%), hsl(90,90%,55%), hsl(120,90%,55%), hsl(150,90%,55%), hsl(180,90%,55%), hsl(210,90%,55%), hsl(240,90%,55%), hsl(270,90%,55%), hsl(300,90%,55%), hsl(330,90%,55%), hsl(359,90%,55%))',
            }}
          />
        </div>

        {/* Odaya gir — sliderdan boşluk */}
        <div className="mt-8">
          <button
            onClick={handleStart}
            className="w-full rounded-[12px] text-base font-medium"
            style={{ height: '52px', backgroundColor: 'var(--color-accent)', color: 'white' }}
          >
            Odaya Gir
          </button>
        </div>
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
