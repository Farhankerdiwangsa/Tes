/** @type {import('next').NextConfig} */
const nextConfig = {
  // Wajib: Memperbaiki error "Module parse failed: Undici"
  transpilePackages: ['undici'],
  
  // Catatan: experimental: { appDir: true } sudah dihapus karena sudah default di Next.js 14.
  
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
    // Menghilangkan peringatan jika variabel CUSTOM_ENV tidak didefinisikan
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
