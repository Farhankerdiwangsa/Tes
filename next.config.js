/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'placehold.co',
      'backend.syaii.my.id',
      'via.placeholder.com',
      'firebasestorage.googleapis.com'
    ],
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };
    
    return config;
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
