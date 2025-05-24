import nextPwa from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
  },
  experimental: {
    serverActions: false, // if you're using server actions in Next 15
  },
};

const withPWA = nextPwa({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // disables PWA in dev
});

export default withPWA(nextConfig);
