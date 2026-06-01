'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const CATEGORIES = ['Mesafe', 'Ağırlık', 'Alan', 'Zaman', 'İnsan'];

const TEASER_QUESTIONS = [
  { text: 'Ay\'a olan ortalama uzaklık kaç', unit: 'km', category: 'distance' },
  { text: 'Bir insan kalbi dakikada kaç kez atar', unit: 'kez', category: 'human' },
  { text: 'Amazon Nehri\'nin uzunluğu kaç', unit: 'km', category: 'distance' },
  { text: 'Dünya\'nın toplam yüzey alanı kaç', unit: 'km²', category: 'space' },
  { text: 'İnsan vücudundaki kan damarlarının toplam uzunluğu kaç', unit: 'km', category: 'human' },
];

const CATEGORY_COLORS: Record<string, string> = {
  distance: '#6366F1',
  scale:    '#F97316',
  space:    '#10B981',
  time:     '#F59E0B',
  human:    '#EC4899',
};

type Phase = 'entering' | 'visible' | 'exiting';

export default function LandingPage() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('entering');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === 'entering') {
      timer = setTimeout(() => setPhase('visible'), 350);
    } else if (phase === 'visible') {
      timer = setTimeout(() => setPhase('exiting'), 2800);
    } else {
      timer = setTimeout(() => {
        setIndex((i) => (i + 1) % TEASER_QUESTIONS.length);
        setPhase('entering');
      }, 350);
    }

    return () => clearTimeout(timer);
  }, [phase]);

  const q = TEASER_QUESTIONS[index];
  const accentColor = CATEGORY_COLORS[q.category];

  const teaserStyle: React.CSSProperties = {
    opacity: phase === 'visible' ? 1 : 0,
    transform:
      phase === 'entering' ? 'translateY(14px)' :
      phase === 'exiting'  ? 'translateY(-14px)' :
      'translateY(0)',
    transition: 'opacity 0.32s ease, transform 0.32s cubic-bezier(0.22,1,0.36,1)',
  };

  return (
    <div
      className="h-full flex flex-col items-center px-6 pt-14 pb-10 overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)', position: 'relative' }}
    >
      {/* Organik blob arka plan */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.28) 0%, rgba(249,115,22,0.10) 50%, transparent 72%)',
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'blob-morph 7s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Başlık */}
      <div className="relative z-10 flex flex-col items-center gap-3 animate-fade-up mb-8">
        <div
          className="text-xs font-mono tracking-widest uppercase"
          style={{ color: 'var(--color-reward)', letterSpacing: '0.18em' }}
        >
          Tahmin Zekası
        </div>
        <h1
          className="text-6xl font-bold tracking-tight text-center leading-none"
          style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}
        >
          Approxense
        </h1>
        <p
          className="text-base text-center max-w-[240px] leading-snug"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Ne kadar doğru tahmin edebilirsin?
        </p>
      </div>

      {/* Teaser soru alanı */}
      <div
        className="relative z-10 w-full flex-1 flex items-center justify-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          className="w-full rounded-2xl px-5 py-5"
          style={{
            ...teaserStyle,
            backgroundColor: `${accentColor}0C`,
            border: `1.5px solid ${accentColor}22`,
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: accentColor, letterSpacing: '0.12em' }}
          >
            Örnek Soru
          </p>
          <p
            className="text-lg font-semibold leading-snug"
            style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
          >
            {q.text}{' '}
            <strong style={{ color: accentColor }}>{q.unit}</strong>
            {'dir?'}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div
              className="h-0.5 flex-1 rounded-full overflow-hidden"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: phase === 'visible' ? '100%' : '0%',
                  backgroundColor: accentColor,
                  transition: phase === 'visible' ? 'width 2.8s linear' : 'none',
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: `${accentColor}80` }}>
              {index + 1}/{TEASER_QUESTIONS.length}
            </span>
          </div>
        </div>
      </div>

      {/* Kategoriler + bilgi */}
      <div className="relative z-10 flex flex-col items-center gap-3 mb-6 animate-fade-up delay-200">
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="text-xs font-medium px-3 py-1.5 rounded-full border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {cat}
            </span>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          5 kategori · 10 soru · 20 saniye
        </p>
      </div>

      {/* CTA */}
      <div className="relative z-10 w-full animate-fade-up delay-300">
        <Link href="/play" className="w-full block">
          <button
            className="w-full rounded-2xl text-base font-semibold text-white animate-cta-glow cursor-pointer"
            style={{
              backgroundColor: 'var(--color-accent)',
              minHeight: '56px',
              letterSpacing: '-0.01em',
              transition: 'background-color 0.15s, transform 0.1s',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Oyna
          </button>
        </Link>
      </div>
    </div>
  );
}
