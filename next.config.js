/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [
      'genkit',
      '@genkit-ai/googleai',
      '@genkit-ai/core',
      '@genkit-ai/ai',
      '@genkit-ai/flow',
      'dotprompt',
      'handlebars',
      '@opentelemetry/instrumentation',
      '@opentelemetry/sdk-node',
      'require-in-the-middle'
    ],
  },
};

module.exports = nextConfig;