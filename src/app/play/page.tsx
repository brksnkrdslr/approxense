import Link from 'next/link';

export default function PlayPage() {
  return (
    <div
      className="h-full flex flex-col justify-center px-5 gap-4"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <h2
        className="text-2xl font-semibold text-center mb-4"
        style={{ color: 'var(--color-text-primary)' }}
      >
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

      <Link href="/room/new" className="w-full block rounded-[16px] border p-6 text-left"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <p className="text-lg font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Çok Oyunculu
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Oda oluştur, arkadaşlarınla rekabet et
        </p>
      </Link>
    </div>
  );
}
