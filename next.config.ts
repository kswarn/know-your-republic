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
};

export default withNextIntl(nextConfig);
