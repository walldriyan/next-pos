/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This allows the Next.js development server to accept requests from the
    // Firebase Studio environment.
    allowedDevOrigins: ["*.cloudworkstations.dev"],
  },
};

module.exports = nextConfig;
