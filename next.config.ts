import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Prisma's query engine must not be bundled into the serverless function graph.
  serverExternalPackages: ['@prisma/client'],
  // Pin the workspace root: an unrelated lockfile in the parent directory would
  // otherwise make Turbopack guess (and warn) at the wrong project root.
  turbopack: {
    root: __dirname,
  },
  images: {
    // Official government photo hosts backing Person.photoUrl: sansad.in
    // (MPs, both houses) and the s3waas.gov.in CDN (Supreme Court judges).
    remotePatterns: [
      { protocol: 'https', hostname: 'sansad.in', pathname: '/getFile/**' },
      { protocol: 'https', hostname: 'cdnbbsr.s3waas.gov.in', pathname: '/**' },
    ],
  },
};

export default withNextIntl(nextConfig);
