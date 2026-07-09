import { readFileSync } from 'fs';
import path from 'path';

// Kiril Ezber, kendi tam sayfa <html> yapısına sahip bağımsız bir mini-uygulama.
// Bu route, kök layout.tsx'in telefon çerçevesi sarmalamasını atlayıp
// public/kiril/index.html dosyasını olduğu gibi (raw) döndürür.
export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'kiril', 'index.html');
  const html = readFileSync(filePath, 'utf-8');

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
