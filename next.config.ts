import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.97'],
  async redirects() {
    return [
      // Kiril, /apps/kiril yapısına taşınmadan önce kısa süre /kiril'de yayındaydı.
      {
        source: '/kiril',
        destination: '/apps/kiril',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      // beforeFiles: /apps/[slug] route.ts'in bu path'i yakalamasından önce
      // devreye girmeli — Tagback kendi Next.js deploy'unda (Vercel multi-zone),
      // burada sadece proxy'leniyor. finder-web basePath'i de /apps/tagback
      // olduğundan path aynen taşınır.
      beforeFiles: [
        {
          source: '/apps/tagback',
          destination: 'https://finder-web-mocha.vercel.app/apps/tagback',
        },
        {
          source: '/apps/tagback/:path*',
          destination: 'https://finder-web-mocha.vercel.app/apps/tagback/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
