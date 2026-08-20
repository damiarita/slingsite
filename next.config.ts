import type { NextConfig } from 'next';
import { withContentlayer } from 'next-contentlayer2';
import CopyPlugin from 'copy-webpack-plugin';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: 'node_modules/@ffmpeg/core/dist/umd',
              to: 'static/ffmpeg',
            },
          ],
        }),
      );
    }
    return config;
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/requests.ts');
export default withNextIntl(withContentlayer(nextConfig));
