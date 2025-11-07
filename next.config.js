/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'placehold.co',
      'backend.syaii.my.id',
      'via.placeholder.com',
      'firebasestorage.googleapis.com'
    ],
    unoptimized: true
  },
  env: {
    CUSTOM_ENV: process.env.CUSTOM_ENV,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // START: Perbaikan untuk Module parse failed: Undici
  transpilePackages: ['undici'],
  // END: Perbaikan untuk Module parse failed: Undici
}

module.exports = nextConfig
