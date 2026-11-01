import type { NextConfig } from 'next';
import { withContentlayer } from 'next-contentlayer2';
import CopyPlugin from 'copy-webpack-plugin';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Only the build is exported. `next dev` with `output: 'export'` answers
  // any URL missing from generateStaticParams with a 500 ("missing param"),
  // ignoring `dynamicParams = false`; without it, unknown URLs get the 404
  // page, as on GitHub Pages.
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
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
            {
              from: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.asyncify.{wasm,mjs}',
              to: 'static/ort/[name][ext]',
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
    // ONNX Runtime's bundle points at itself with new URL(…, import.meta.url)
    // to start its proxy and pthread workers. In a worker chunk that URL
    // becomes a module, and the bundle throws while loading, silently. We run
    // single-threaded, so it never starts them: leave the URL alone. That
    // also stops webpack emitting the runtime's files, hence the copy above
    // (and `wasmPaths` in workers/ai.ts).
    // Its Node.js branch uses `require` in a way webpack can't follow. That
    // branch never runs in a browser.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /onnxruntime-web/, message: /Critical dependency/ },
    ];
    config.module.rules.push({
      test: /onnxruntime-web[\\/]dist[\\/].*\.mjs$/,
      parser: { url: false },
    });
    return config;
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/requests.ts');
export default withNextIntl(withContentlayer(nextConfig));
