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
    // The multi-threaded AVIF encoder needs SharedArrayBuffer, which needs
    // COOP/COEP headers GitHub Pages can't serve — so this path is dead
    // code in production anyway, and its internal worker self-import is
    // exactly what creates the circular chunk-runtime dependency. Redirect
    // it to the single-threaded encoder, which has no nested worker at all.
    config.resolve.alias = {
      ...config.resolve.alias,
      [require.resolve('@jsquash/avif/codec/enc/avif_enc_mt.js')]:
        require.resolve('@jsquash/avif/codec/enc/avif_enc.js'),
    };
    return config;
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/requests.ts');
export default withNextIntl(withContentlayer(nextConfig));
