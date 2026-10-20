import type { NextConfig } from "next";

// Project sites are served from /<repo>. User/org *.github.io sites stay at the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Only static-export for GitHub Pages builds. Local `next dev` stays dynamic so
// Sanity Studio catch-all routes (/admin/structure/…) work without pre-rendering every path.
const isPagesBuild = process.env.GITHUB_PAGES === "true" || Boolean(basePath);

const nextConfig: NextConfig = {
  ...(isPagesBuild ? { output: "export" as const } : {}),
  trailingSlash: true,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  images: {
    // GitHub Pages has no image optimizer; keep unoptimized locally too for parity.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
