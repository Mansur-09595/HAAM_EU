import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
let userConfig = undefined

try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch {
  try {
    // fallback to CJS import
    userConfig = await import('./v0-user-next.config')
  } catch {
    // ignore error
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode in production
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
    // Only host without protocol
    domains: ['localhost', 'haam-db.onrender.com'],
  },

  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: 'http://localhost:8000/media/:path*',
      },
    ]
  },

  // Custom webpack adjustments
  webpack(config, { dev, isServer }) {
    // Disable eval-based sourcemaps in development to satisfy CSP
    if (dev && !isServer) {
      config.devtool = 'cheap-module-source-map'
    }
    // Resolve alias for cleaner imports
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')
    return config
  },

  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },

  // Включаем standalone режим для Docker
  output: 'standalone',
}

// Merge user config if exists
if (userConfig) {
  const config = userConfig.default || userConfig
  for (const key in config) {
    if (typeof nextConfig[key] === 'object' && !Array.isArray(nextConfig[key])) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig
