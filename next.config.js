/** @type {import('next').NextConfig} */
const nextConfig = {
  // START: Perbaikan untuk Next.js 14 dan Error Undici
  transpilePackages: ['undici'],
  // END: Perbaikan untuk Next.js 14 dan Error Undici
  
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
    CUSTOM_ENV: process.env.CUSTOM_ENV || '',
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
  
  // Catatan: experimental: { appDir: true } dihapus karena sudah default di Next.js 14.
}

module.exports = nextConfig
