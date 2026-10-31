import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Generated or copied at build time, not source.
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    '.contentlayer/**',
    'public/ffmpeg/**',
    'static/ffmpeg/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
