// Approxense domaininde /apps/<slug> altında barındırılan, kendi kendine yeten
// (self-contained) mini-uygulamaların kaydı. Her biri public/apps/<slug>/
// içinde kendi index.html'ine sahiptir; route.ts bu klasörü olduğu gibi servis eder.
// İleride bir "uygulama menüsü" / landing page yapılırsa bu liste üzerinden
// otomatik oluşturulabilir.
export interface MiniApp {
  slug: string;
  name: string;
  description: string;
  addedAt: string; // YYYY-MM-DD
}

export const miniApps: MiniApp[] = [
  {
    slug: 'kiril',
    name: 'Kiril Ezber',
    description: 'Bulgarca Kiril alfabesini ezberlemek için flashcard uygulaması',
    addedAt: '2026-07-09',
  },
  {
    // İstisna: diğerlerinden farklı olarak public/apps/tagback/index.html YOK —
    // kendi Next.js deploy'unda barındırılır, next.config.ts rewrites() ile
    // (beforeFiles) buraya proxy'lenir.
    slug: 'tagback',
    name: 'Tagback',
    description: "QR sticker ile kayıp eşya iadesi (mahremiyet odaklı)",
    addedAt: '2026-07-10',
  },
];
