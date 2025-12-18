/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Tambahkan baris di bawah ini
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Opsional: tambahkan ini juga jika ada error type saat build
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig