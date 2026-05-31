'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerHue, hueToColor, savePlayerHue } from '@/lib/utils';
import { saveSettings } from '@/lib/questions';
import { DEFAULT_SETTINGS, GameSettings } from '@/types';

export default function PlayPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [hue, setHue] = useState(240);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('approxense_display_name');
      if (saved && !saved.startsWith('Misafir')) setNickname(saved);
      setHue(getPlayerHue());
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const color = hueToColor(hue);

  async function handlePlay() {
    const trimmed = nickname.trim();
    if (trimmed) localStorage.setItem('approxense_display_name', trimmed);
    savePlayerHue(hue);
    router.push('/room/new');
  }

  return (
    <div className="h-full flex flex-col px-5 pt-6 pb-8 overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      <button onClick={() => router.push('/')} className="self-start text-sm px-2 py-1 rounded-lg mb-6" style={{ color: 'var(--color-text-muted)' }}>
        ← Geri
      </button>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Takma Ad</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Diğer oyuncular seni böyle görecek</p>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.blur()}
        placeholder="Takma adın"
        maxLength={20}
        className="w-full text-center text-2xl font-bold outline-none bg-transparent border-none mb-6"
        style={{ color }}
      />

      <div className="mb-10">
        <input
          type="range" min={0} max={359} value={hue}
          onChange={(e) => setHue(Number(e.target.value))}
          className="w-full h-3 rounded-full cursor-pointer appearance-none"
          style={{ background: 'linear-gradient(to right, hsl(0,90%,55%), hsl(30,90%,55%), hsl(60,90%,55%), hsl(90,90%,55%), hsl(120,90%,55%), hsl(150,90%,55%), hsl(180,90%,55%), hsl(210,90%,55%), hsl(240,90%,55%), hsl(270,90%,55%), hsl(300,90%,55%), hsl(330,90%,55%), hsl(359,90%,55%))' }}
        />
      </div>

      <button
        onClick={handlePlay}
        className="w-full rounded-[12px] text-base font-medium"
        style={{ height: '52px', backgroundColor: 'var(--color-accent)', color: 'white' }}
      >
        Oyna
      </button>
    </div>
  );
}
