/** @type {import('next').NextConfig} */
const nextConfig = {
  // SOLUSI KRITIS untuk "Module parse failed: Undici"
  // Ini memberitahu Next.js (SWC) untuk mengkompilasi undici yang menggunakan sintaks modern.
  transpilePackages: ['undici'],
  
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
}

module.exports = nextConfig
