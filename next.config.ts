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
};

export default nextConfig;
