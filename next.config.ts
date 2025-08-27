import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Robots-Tag',
          value: 'noindex, nofollow, nosnippet, noarchive, noimageindex, nocache'
        }
      ]
    }
  ]
};

export default nextConfig;
