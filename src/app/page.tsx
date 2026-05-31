import Link from 'next/link';

export default function LandingPage() {
  return (
    <div
      className="h-full flex flex-col items-center justify-center px-5"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="flex flex-col items-center gap-12 w-full">
        <div className="text-center">
          <h1
            className="text-5xl font-semibold tracking-tight mb-3"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'DM Sans, sans-serif' }}
          >
            Approxense
          </h1>
          <p className="text-base" style={{ color: 'var(--color-text-muted)' }}>
            Tahmin zekası oyunu
          </p>
        </div>

        <Link href="/play" className="w-full block">
          <button
            className="w-full rounded-[12px] text-base font-medium text-white transition-colors active:scale-95"
            style={{
              backgroundColor: 'var(--color-accent)',
              minHeight: '52px',
              padding: '14px 24px',
            }}
          >
            Oyna
          </button>
        </Link>
      </div>
    </div>
  );
}
