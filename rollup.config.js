import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/content.js',
  output: {
    dir: 'dist',
  },
  plugins: [resolve(), json(), commonjs()],
};
