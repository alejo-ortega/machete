import type { NextConfig } from "next";

// Static export. Locally the site is served from "/"; set
// NEXT_PUBLIC_BASE_PATH=/machete when building for a sub-path host.
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  images: { unoptimized: true },
};

export default nextConfig;
