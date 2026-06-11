import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    // All production images are local (/media/*.jpg). No remote patterns needed yet.
    // Audited dimensions (sips, jun 2026):
    //   portrait 9:16 → 900×1600 (cuchillo-hero, cuchillo-full, product-cuchillo-samurai)
    //   portrait 3:4  → 900×1200, 1050×1400 (most product & wellness photos)
    //   square 1:1    → 1200×1200, 600×600 (product sets, tambor-lengua-real)
    //   landscape     → 1600×900, 1400×1050 (editorial-mesa, termo, pistola)
    // photo.tsx uses fill+cover mode for all local images → no width/height required.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 768, 1024, 1280, 1600],
    imageSizes: [64, 128, 200, 320, 480],
  },
}

export default nextConfig
