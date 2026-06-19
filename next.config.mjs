import nextPwa from '@ducanh2912/next-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
  },
  outputFileTracingRoot: path.resolve(__dirname),
};

const withPWA = nextPwa({
  dest: 'public',
  register: true,
  skipWaiting: true,
  swSrc: 'public/custom-sw.js', // 👈 Add this line
  disable: true,
});

export default withPWA(nextConfig);
