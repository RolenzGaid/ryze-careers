/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fonts are loaded via <link> at runtime, so skip build-time font inlining.
  optimizeFonts: false,
};
module.exports = nextConfig;
