import type { NextConfig } from "next";

const LEGACY_CHRISTIAN_EXAMPLE_SLUG = "bannerman-samuel-2026";
const CHRISTIAN_EXAMPLE_SLUG = "samuel-mensah-2026";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: `/memorial/${LEGACY_CHRISTIAN_EXAMPLE_SLUG}`,
        destination: `/memorial/${CHRISTIAN_EXAMPLE_SLUG}`,
        permanent: true,
      },
      {
        source: `/memorial/${LEGACY_CHRISTIAN_EXAMPLE_SLUG}/:path*`,
        destination: `/memorial/${CHRISTIAN_EXAMPLE_SLUG}/:path*`,
        permanent: true,
      },
      {
        source: "/examples/complete-full",
        destination: "/examples/complete",
        permanent: false,
      },
      {
        source: "/examples/complete-full/:themeId",
        destination: "/examples/complete/:themeId",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
