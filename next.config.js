/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"]
  },
  async headers() {
    return [
      {
        source: "/api/categories",
        headers: [{ key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" }]
      },
      {
        source: "/api/blogs",
        headers: [{ key: "Cache-Control", value: "public, s-maxage=120, stale-while-revalidate=300" }]
      },
      {
        source: "/api/store-settings",
        headers: [{ key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" }]
      },
      {
        source: "/api/banners",
        headers: [{ key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" }]
      },
      {
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      }
    ];
  }
};

module.exports = nextConfig;
