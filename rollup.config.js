import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/background.js',
    output: {
      dir: 'dist',
    },
    plugins: [resolve(), json(), commonjs()],
  },
  {
    input: 'src/content.js',
    output: {
      file: 'dist/content.js',
    },
    plugins: [resolve(), json(), commonjs()],
  },
];
