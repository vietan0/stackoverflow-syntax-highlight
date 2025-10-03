import { defineConfig } from 'rolldown';

export default defineConfig([
  {
    input: 'src/background.js',
    output: {
      dir: 'dist',
      minify: true,
    },
  },
  {
    input: 'src/content.js',
    output: {
      file: 'dist/content.js',
      minify: true,
    },
  },
]);
