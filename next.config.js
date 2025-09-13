/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    // optimizeCss disabled to prevent chunk resolution issues during build
    // optimizeCss: true,
    optimizePackageImports: ['@heroicons/react'],
    // Enable TypeScript build cache
    typedRoutes: false,
  },
  
  // TypeScript configuration
  typescript: {
    // Enable TypeScript build cache for faster builds
    ignoreBuildErrors: false,
  },
  
  // Fast Refresh configuration to prevent reload errors
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Configure Fast Refresh to be more stable
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      
      // Add Fast Refresh configuration
      config.plugins = config.plugins.map((plugin) => {
        if (plugin.constructor.name === 'ReactRefreshPlugin') {
          plugin.options = {
            ...plugin.options,
            overlay: false, // Disable error overlay
            forceEnable: false, // Don't force enable
          };
        }
        return plugin;
      });
    }
    return config;
  },
  
  // Disable static generation for all pages to prevent navigator errors
  // output: 'standalone', // Disabled for development
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimizations
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/men/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wkjvstuttbeyqzyjayxj.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'compressed.photo.goodreads.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        pathname: '/**',
      },
    ],
    // Performance optimizations for images
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Bundle analyzer for development
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer')({
          enabled: true,
        }))()
      );
      return config;
    },
  }),
};

module.exports = nextConfig; 