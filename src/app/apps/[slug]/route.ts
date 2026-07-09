import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';

// Tek bir genel route: public/apps/<slug>/index.html altında bir dosya varsa
// onu ham (raw) HTML olarak döndürür, kök layout'un telefon çerçevesini atlar.
// Yeni bir mini-uygulama eklemek için tek yapılması gereken public/apps/<slug>/
// altına kendi kendine yeten bir index.html (+ ikon/manifest vs.) koymak —
// buraya yeni kod eklemeye gerek yok.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'public', 'apps', slug, 'index.html');

  if (!existsSync(filePath)) {
    notFound();
  }

  const html = readFileSync(filePath, 'utf-8');

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
