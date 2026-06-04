import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Approxense',
  description: 'İnsan tahmin zekasını ölçen ve geliştiren tahmin oyunu',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="google-adsense-account" content="ca-pub-1152196437732185" />
      </head>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1152196437732185"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <body suppressHydrationWarning className="phone-body">
        {/* Desktop: telefon çerçevesi | Mobile: tam ekran */}
        <div className="phone-outer">
          <div className="phone-frame">
            {/* Desktop'ta notch */}
            <div className="phone-notch" aria-hidden="true">
              <div className="phone-notch-pill" />
            </div>
            {/* İçerik */}
            <div className="phone-content">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
