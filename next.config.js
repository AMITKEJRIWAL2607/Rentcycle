/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // Add webpack configuration to handle Windows path and symlink issues
  webpack: (config, { isServer }) => {
    // Fix for Windows EINVAL errors with server-reference-manifest.js
    // This is especially common with OneDrive which uses symlinks
    if (process.platform === 'win32') {
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

