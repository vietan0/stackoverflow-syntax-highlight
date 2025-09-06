import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';

export default defineConfig([
  {
    input: 'src/background.js',
    output: {
      dir: 'dist',
    },
    plugins: [nodeResolve({ preferBuiltins: false }), commonjs()],
    onwarn(warning, defaultHandler) {
      if (warning.code !== 'THIS_IS_UNDEFINED')
        defaultHandler(warning);
    },
  },
  {
    input: 'src/content.js',
    output: {
      file: 'dist/content.js',
    },
    plugins: [nodeResolve(), commonjs()],
  },
]);
