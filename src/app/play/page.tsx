'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerHue, hueToColor, savePlayerHue } from '@/lib/utils';
import { getSettings, saveSettings } from '@/lib/questions';
import { GameSettings, DEFAULT_SETTINGS } from '@/types';

type Step = 'mode' | 'single-settings' | 'multi-nickname';

export default function PlayPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('mode');
  const [nickname, setNickname] = useState('');
  const [hue, setHue] = useState(240);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('approxense_display_name');
      if (saved && !saved.startsWith('Misafir')) setNickname(saved);
      setHue(getPlayerHue());
      setSettings(getSettings());
    }
  }, []);

  useEffect(() => {
    if (step === 'multi-nickname') setTimeout(() => inputRef.current?.focus(), 50);
  }, [step]);

  const color = hueToColor(hue);

  function handleSingleStart() {
    saveSettings(settings);
    router.push('/game');
  }

  function handleMultiStart() {
    const trimmed = nickname.trim();
    if (trimmed) localStorage.setItem('approxense_display_name', trimmed);
    savePlayerHue(hue);
    saveSettings(settings);
    router.push('/room/new');
  }

  // Tek oyuncu ayarlar
  if (step === 'single-settings') {
    return (
      <div className="h-full flex flex-col px-5 pt-6 pb-8 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg)' }}>
        <button onClick={() => setStep('mode')} className="self-start text-sm px-2 py-1 rounded-lg mb-6" style={{ color: 'var(--color-text-muted)' }}>
          ← Geri
        </button>
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>Ayarlar</h2>

        <SettingsPanel settings={settings} onChange={setSettings} />

        <div className="mt-8">
          <button
            onClick={handleSingleStart}
            className="w-full rounded-[12px] text-base font-medium"
            style={{ height: '52px', backgroundColor: 'var(--color-accent)', color: 'white' }}
          >
            Başla
          </button>
        </div>
      </div>
    );
  }

  // Çok oyuncu: nickname + ayarlar
  if (step === 'multi-nickname') {
    return (
      <div className="h-full flex flex-col px-5 pt-6 pb-8 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg)' }}>
        <button onClick={() => setStep('mode')} className="self-start text-sm px-2 py-1 rounded-lg mb-6" style={{ color: 'var(--color-text-muted)' }}>
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
          onClick={handleMultiStart}
          className="w-full rounded-[12px] text-base font-medium"
          style={{ height: '52px', backgroundColor: 'var(--color-accent)', color: 'white' }}
        >
          Odaya Gir
        </button>
      </div>
    );
  }

  // Mod seçimi
  return (
    <div className="h-full flex flex-col justify-center px-5 gap-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <h2 className="text-2xl font-semibold text-center mb-4" style={{ color: 'var(--color-text-primary)' }}>
        Mod Seç
      </h2>

      <button
        onClick={() => setStep('single-settings')}
        className="w-full rounded-[16px] border p-6 text-left"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <p className="text-lg font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Tek Oyuncu</p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Kendi başına oyna, skorunu gör</p>
      </button>

      <button
        onClick={() => setStep('multi-nickname')}
        className="w-full rounded-[16px] border p-6 text-left"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <p className="text-lg font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Çok Oyunculu</p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Oda oluştur, arkadaşlarınla rekabet et</p>
      </button>
    </div>
  );
}
