/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true, remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }] },
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
