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
      timer = setTimeout(() => setPhase('visible'), 600);
    } else if (phase === 'visible') {
      timer = setTimeout(() => setPhase('exiting'), 5000);
    } else {
      // exit animasyonu biter bitmez (0ms gap) yeni soru
      timer = setTimeout(() => {
        setIndex((i) => (i + 1) % TEASER_QUESTIONS.length);
        setPhase('entering');
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [phase]);

  const q = TEASER_QUESTIONS[index];
  const accentColor = CATEGORY_COLORS[q.category];

  const teaserStyle: React.CSSProperties = {
    opacity: phase === 'visible' ? 1 : 0,
    transform:
      phase === 'entering' ? 'translateY(20px)' :
      phase === 'exiting'  ? 'translateY(-20px)' :
      'translateY(0)',
    transition: phase === 'exiting'
      ? 'opacity 0.85s ease, transform 0.85s cubic-bezier(0.4,0,0.2,1)'
      : 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
  };

  return (
    <div
      className="h-full flex flex-col px-6 overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)', position: 'relative', paddingTop: 'max(48px, env(safe-area-inset-top))', paddingBottom: 'max(28px, env(safe-area-inset-bottom))' }}
    >
      {/* Blob */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '360px',
          height: '360px',
          background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.25) 0%, rgba(249,115,22,0.08) 55%, transparent 72%)',
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'blob-morph 7s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Başlık ── */}
      <div className="relative z-10 flex flex-col items-center gap-2 animate-fade-up" style={{ marginBottom: '6px' }}>
        <div
          className="text-xs font-mono uppercase"
          style={{ color: 'var(--color-reward)', letterSpacing: '0.18em' }}
        >
          Tahmin Zekası
        </div>
        <h1
          className="text-5xl font-bold tracking-tight text-center leading-none"
          style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}
        >
          Approxense
        </h1>
        <p
          className="text-sm text-center leading-snug"
          style={{ color: 'var(--color-text-secondary)', maxWidth: '220px' }}
        >
          Ne kadar doğru tahmin edebilirsin?
        </p>
      </div>

      {/* ── Kategoriler (B yukarı çıktı) ── */}
      <div className="relative z-10 flex flex-col items-center gap-2 animate-fade-up delay-100" style={{ marginBottom: '14px', marginTop: '18px' }}>
        <div className="flex flex-wrap justify-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="text-xs font-medium px-3 py-1 rounded-full border"
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

      {/* ── Teaser soru (A ile B arasında) ── */}
      <div className="relative z-10 flex-1 flex items-center" aria-live="polite" aria-atomic="true">
        <div
          className="w-full rounded-2xl px-5 py-5"
          style={{
            ...teaserStyle,
            backgroundColor: `${accentColor}0A`,
            border: `1.5px solid ${accentColor}1E`,
          }}
        >
          <p
            className="text-lg font-semibold leading-snug mb-4"
            style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
          >
            {q.text}{' '}
            <strong style={{ color: accentColor }}>{q.unit}</strong>
            {'dir?'}
          </p>
          <div
            className="h-0.5 w-full rounded-full overflow-hidden"
            style={{ backgroundColor: `${accentColor}18` }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: phase === 'visible' ? '100%' : '0%',
                backgroundColor: accentColor,
                transition: phase === 'visible' ? 'width 5s linear' : 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="relative z-10 animate-fade-up delay-200" style={{ marginTop: '16px' }}>
        <Link href="/play" className="w-full block">
          <button
            className="w-full rounded-2xl text-base font-semibold text-white animate-cta-glow cursor-pointer"
            style={{
              backgroundColor: 'var(--color-accent)',
              minHeight: '54px',
              letterSpacing: '-0.01em',
              transition: 'transform 0.1s',
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
