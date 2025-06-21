import nextPwa from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
  },
};

const withPWA = nextPwa({
  dest: 'public',
  register: true,
  skipWaiting: true,
  swSrc: 'public/custom-sw.js', // 👈 Add this line
  disable: process.env.NODE_ENV === 'development',
});

export default withPWA(nextConfig);
