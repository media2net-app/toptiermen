/** @type {import('next').NextConfig} */
const nextConfig = {
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
  },
};

module.exports = nextConfig; 