import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: 'src/content.js',
	output: {
		file: 'dist/content.js',
		format: 'iife',
		inlineDynamicImports: true,
	},
  plugins: [resolve(), commonjs()]
};