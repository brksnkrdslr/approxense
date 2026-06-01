import Link from 'next/link';

const CATEGORIES = ['Mesafe', 'Ağırlık', 'Alan', 'Zaman', 'İnsan'];

export default function LandingPage() {
  return (
    <div
      className="h-full flex flex-col items-center justify-between px-6 pt-16 pb-10 overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)', position: 'relative' }}
    >
      {/* Organik blob arka plan */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '420px',
          height: '420px',
          background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.32) 0%, rgba(249,115,22,0.12) 50%, transparent 72%)',
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'blob-morph 7s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Üst alan — başlık */}
      <div className="relative z-10 flex flex-col items-center gap-4 animate-fade-up">
        <div
          className="text-xs font-mono tracking-widest uppercase"
          style={{ color: 'var(--color-reward)', letterSpacing: '0.18em' }}
        >
          Tahmin Zekası
        </div>
        <h1
          className="text-6xl font-bold tracking-tight text-center leading-none"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.03em' }}
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

      {/* Orta — kategoriler */}
      <div className="relative z-10 flex flex-col items-center gap-3 animate-fade-up delay-200">
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

      {/* Alt — CTA */}
      <div className="relative z-10 w-full flex flex-col gap-3 animate-fade-up delay-300">
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
