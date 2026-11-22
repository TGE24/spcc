import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Admin image uploads (hero slides, events, photos, …) go through
      // Server Actions, which reject bodies over 1MB by default. Files are
      // capped at 5MB in src/lib/storage.ts (matching the Storage bucket's
      // file_size_limit); the extra headroom covers multipart overhead and
      // the other form fields sent alongside the file.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
