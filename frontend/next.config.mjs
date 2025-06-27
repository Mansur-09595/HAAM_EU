let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch  {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch {
    // ignore error
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['https://haam-db.onrender.com'],
  },
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'haam-db.onrender.com',
      pathname: '/media/**',
    },
  ],
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: 'https://haam-db.onrender.com/media/:path*',
      },
    ]
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
}

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
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
