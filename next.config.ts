import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // svg2vectordrawable 관련 경고 무시
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };
    return config;
  },
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7일 캐시
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // 외부 이미지 도메인 추가
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.chalpu.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
