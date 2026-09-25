/**
 * Uploaded product and category images live in the Supabase Storage bucket
 * `catalog` and are served from the project's own host, so next/image needs
 * that host allow-listed. Derived from the same env var the app uses.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }]
      : [],
  },
  experimental: {
    serverActions: {
      // Image uploads go through a Server Action. The bucket caps files at
      // 5 MB; this leaves room for multipart overhead (docs: serverActions).
      bodySizeLimit: '6mb',
    },
  },
};

export default nextConfig;
