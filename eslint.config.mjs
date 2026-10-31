import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // next/image needs an optimizer (none in a static export), and its
      // <head> rule is for the Pages Router.
      '@next/next/no-img-element': 'off',
      '@next/next/no-head-element': 'off',
    },
  },
  // Generated or copied at build time, not source.
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    '.contentlayer/**',
    'public/ffmpeg/**',
    'static/ffmpeg/**',
    'next-env.d.ts',
    // Vendored skill.
    '.agents/**',
  ]),
]);

export default eslintConfig;
