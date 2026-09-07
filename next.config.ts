import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The water bill photo reaches Convex through a server action, because
    // requesting an upload URL needs a secret the browser must not hold. It is
    // compressed to well under this first; the headroom covers multipart
    // overhead, which the limit counts.
    serverActions: { bodySizeLimit: "2mb" },
  },
  /* config options here */
};

export default nextConfig;
