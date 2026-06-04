'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const CATEGORIES = ['Mesafe', 'Ağırlık', 'Alan', 'Zaman', 'İnsan'];

const TEASER_QUESTIONS = [
  { text: 'Ay\'a olan ortalama uzaklık kaç', unit: 'km', suffix: '\'dir?', category: 'distance' },
  { text: 'Bir mavi balinanın ağırlığı kaç', unit: 'ton', suffix: '\'dur?', category: 'scale' },
  { text: 'Sahra Çölü\'nün alanı kaç', unit: 'km²', suffix: '\'dir?', category: 'space' },
  { text: 'Osmanlı İmparatorluğu kaç', unit: 'yıl', suffix: ' sürdü?', category: 'time' },
  { text: 'İnsan ömrü boyunca kaç', unit: 'kez', suffix: ' nefes alır?', category: 'human' },
];

const CATEGORY_COLORS: Record<string, string> = {
  distance: '#6366F1',
  scale:    '#F97316',
  space:    '#10B981',
  time:     '#F59E0B',
  human:    '#EC4899',
};

const EXIT_MS = 850;
const ENTER_MS = 600;
const VISIBLE_MS = 5000;

type Phase = 'entering' | 'visible' | 'exiting';

export default function LandingPage() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('entering');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (phase === 'entering') {
      timer = setTimeout(() => setPhase('visible'), ENTER_MS);
    } else if (phase === 'visible') {
      timer = setTimeout(() => setPhase('exiting'), VISIBLE_MS);
    } else {
      // EXIT_MS kadar bekle (animasyon bitsin), sonra yeni soru
      timer = setTimeout(() => {
        setIndex((i) => (i + 1) % TEASER_QUESTIONS.length);
        setPhase('entering');
      }, EXIT_MS);
    }
    return () => clearTimeout(timer);
  }, [phase]);

  const q = TEASER_QUESTIONS[index];
  const accentColor = CATEGORY_COLORS[q.category];

  const teaserStyle: React.CSSProperties = {
    opacity: phase === 'visible' ? 1 : 0,
    transform:
      phase === 'entering' ? 'translateY(22px)' :  // alttan gelir
      phase === 'exiting'  ? 'translateY(-22px)' : // yukarı kayar
      'translateY(0)',
    transition: phase === 'exiting'
      ? `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms cubic-bezier(0.4,0,0.2,1)`
      : `opacity ${ENTER_MS}ms ease, transform ${ENTER_MS}ms cubic-bezier(0.22,1,0.36,1)`,
  };

  return (
    <div
      className="h-full flex flex-col px-6 overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg)',
        position: 'relative',
        paddingTop: 'max(44px, env(safe-area-inset-top))',
        paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
      }}
    >
      {/* Blob */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '360px', height: '360px',
          background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.24) 0%, rgba(249,115,22,0.08) 55%, transparent 72%)',
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
          top: '44%', left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'blob-morph 7s ease-in-out infinite',
          pointerEvents: 'none', zIndex: 0,
        }}
      />

      {/* ── Başlık (üstte) ── */}
      <div className="relative z-10 flex flex-col items-center gap-2 animate-fade-up">
        <div className="text-xs font-mono uppercase" style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.18em' }}>
          Tahmin Zekası
        </div>
        <h1
          className="text-5xl font-bold tracking-tight text-center leading-none"
          style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}
        >
          Approxense
        </h1>
        <p className="text-sm text-center leading-snug" style={{ color: 'var(--color-text-secondary)', maxWidth: '220px' }}>
          Ne kadar doğru tahmin edebilirsin?
        </p>
      </div>

      {/* ── Teaser (tam ortada) ── */}
      <div
        className="relative z-10 flex-1 flex items-center justify-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          className="w-full rounded-2xl px-5 py-5"
          style={{
            ...teaserStyle,
            backgroundColor: `${accentColor}0A`,
            border: `1.5px solid ${accentColor}35`,
          }}
        >
          <p
            className="text-lg font-semibold leading-snug mb-4"
            style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
          >
            {q.text}{' '}
            <strong style={{ color: accentColor }}>{q.unit}</strong>
            {q.suffix}
          </p>
          <div className="h-0.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: `${accentColor}18` }}>
            <div
              className="h-full rounded-full"
              style={{
                width: phase === 'visible' ? '100%' : '0%',
                backgroundColor: accentColor,
                transition: phase === 'visible' ? `width ${VISIBLE_MS}ms linear` : 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Kategoriler (soru ile butonun arasında) ── */}
      <div className="relative z-10 flex flex-col items-center gap-2 animate-fade-up delay-100" style={{ marginBottom: '16px' }}>
        <div className="flex flex-wrap justify-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="text-xs font-medium px-3 py-1.5 rounded-full border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              {cat}
            </span>
          ))}
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          5 kategori · 10 soru · 20 saniye
        </p>
      </div>

      {/* ── CTA ── */}
      <div className="relative z-10 animate-fade-up delay-200">
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

      {/* ── Footer ── */}
      <div className="relative z-10 flex justify-center pt-4 pb-1">
        <Link
          href="/gizlilik"
          className="text-xs"
          style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}
        >
          Gizlilik Politikası
        </Link>
      </div>
    </div>
  );
}
