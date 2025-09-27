import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer2";
import CopyPlugin from "copy-webpack-plugin";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  productionBrowserSourceMaps: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: 'node_modules/@ffmpeg/core/dist/umd',
              to: 'static/ffmpeg'
            }
          ]
        })
      );
    }
    return config;
  }
};

export default withContentlayer(nextConfig);