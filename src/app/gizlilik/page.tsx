import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası — Approxense',
  description: 'Approxense gizlilik politikası ve kişisel veri kullanımı hakkında bilgi.',
};

export default function GizlilikPage() {
  return (
    <div className="absolute inset-0 overflow-y-auto px-5 py-8" style={{ overscrollBehavior: 'contain' }}>
      {/* Geri butonu */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-8 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Ana Sayfa
      </Link>

      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
        Gizlilik Politikası
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">
        Son güncelleme: Haziran 2025
      </p>

      <div className="space-y-6 text-sm text-[var(--color-text-primary)] leading-relaxed">

        <section>
          <h2 className="font-semibold text-base mb-2">1. Genel Bakış</h2>
          <p>
            Approxense (<strong>approxense.com</strong>), insan tahmin zekasını ölçen ve geliştiren
            bir tahmın oyunudur. Bu gizlilik politikası, sitemizi kullanırken hangi verilerin
            toplandığını ve nasıl kullanıldığını açıklamaktadır.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">2. Toplanan Veriler</h2>
          <p className="mb-2">Approxense aşağıdaki anonim verileri toplar:</p>
          <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)]">
            <li>Oyun oturumu verileri (oturum ID, kategori, tur sayısı)</li>
            <li>Tahmin değerleri ve skorlar</li>
            <li>Çok oyunculu oda bilgileri (oda ID, oyuncu sayısı)</li>
            <li>Tarayıcı ve cihaz bilgileri (reklam gösterimi için)</li>
          </ul>
          <p className="mt-2">
            <strong>Kişisel kimlik bilgisi toplanmaz.</strong> Kullanıcı adları ve renkler
            yalnızca cihazınızda (localStorage) saklanır.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">3. Çerezler ve Reklam</h2>
          <p className="mb-2">
            Sitemizde <strong>Google AdSense</strong> aracılığıyla reklamlar gösterilmektedir.
            Google, ilgi alanlarınıza göre kişiselleştirilmiş reklamlar sunmak amacıyla
            çerez kullanabilir.
          </p>
          <p className="mb-2">
            Google'ın reklam çerezlerini nasıl kullandığı hakkında daha fazla bilgi için:
          </p>
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] underline"
          >
            policies.google.com/technologies/ads
          </a>
          <p className="mt-2">
            Avrupa Ekonomik Alanı (AEA), Birleşik Krallık ve İsviçre'deki kullanıcılar,
            sitemizi ziyaret ederken reklam kişiselleştirme için rıza göstermeleri istenecektir.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">4. Üçüncü Taraf Hizmetler</h2>
          <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)]">
            <li><strong>Supabase:</strong> Veritabanı ve gerçek zamanlı çok oyunculu altyapı</li>
            <li><strong>Vercel:</strong> Hosting ve içerik dağıtım ağı</li>
            <li><strong>Google AdSense:</strong> Reklam hizmetleri</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">5. Veri Güvenliği</h2>
          <p>
            Toplanan tüm veriler anonim olup kişisel kimliğinizle ilişkilendirilmez.
            Oyun verileri yalnızca hizmetin iyileştirilmesi amacıyla kullanılır.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">6. İletişim</h2>
          <p>
            Gizlilik politikamızla ilgili sorularınız için:{' '}
            <a
              href="mailto:buraksenkardesler@gmail.com"
              className="text-[var(--color-accent)] underline"
            >
              buraksenkardesler@gmail.com
            </a>
          </p>
        </section>

      </div>

      <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
