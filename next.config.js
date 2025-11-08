/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow images from external sources (Unsplash, UploadThing, etc.)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io', // UploadThing CDN
      },
      {
        protocol: 'https',
        hostname: '*.uploadthing.com',
      },
    ],
  },
  // Temporarily disable ESLint during builds for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Temporarily disable TypeScript errors during builds for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add webpack configuration to handle Windows path and symlink issues (development only)
  webpack: (config, { isServer, dev }) => {
    // Only apply Windows-specific fixes in development
    if (dev && process.platform === 'win32') {
      // Disable symlink resolution to avoid EINVAL errors on Windows
      config.resolve.symlinks = false
      
      // Use file polling instead of native file watching (better for OneDrive)
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/dist/**',
        ],
        poll: 1000, // Poll files every second (helps with OneDrive sync delays)
        aggregateTimeout: 300, // Delay before rebuilding after first change
      }
    }
    return config
  },
}

module.exports = nextConfig

