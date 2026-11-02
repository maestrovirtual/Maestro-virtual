import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: ["jose"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placeholder.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);