import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/content.js',
  output: {
    file: 'dist/content.js',
    format: 'iife',
    inlineDynamicImports: true,
  },
  plugins: [resolve(), json(), commonjs()],
};
