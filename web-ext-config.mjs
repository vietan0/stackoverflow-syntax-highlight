import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

export default {
  run: {
    startUrl: [
      'https://stackoverflow.com/questions/79756656', // default s-code-block
      'https://stackoverflow.com/questions/79782075', // no lang specified
      'https://stackoverflow.com/questions/38916344', // guessed lang (if slow connection) different from specified lang
    ],
    firefoxProfile: 'ext-dev',
  },
  sign: {
    channel: 'listed',
    apiKey: process.env.WEB_EXT_API_KEY,
    apiSecret: process.env.WEB_EXT_API_SECRET,
  },
  ignoreFiles: [
    'src/content.js',
    'src/customizeFont.js',
    'src/background.js',
    '**/*.js.map',
    '**/*.md',
    '**/*config.{?(m|c)js,ts}',
    '**/!(manifest).json',
    'screenshots',
    'pnpm-lock.yaml',
  ],
};
