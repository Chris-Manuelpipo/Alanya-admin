/** @type {import('next').NextConfig} */
/**const nextConfig = {};

export default nextConfig;*/


/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin',
  assetPrefix: '/admin',
  output: 'standalone', // build plus léger, pratique pour PM2/serveur
};

module.exports = nextConfig;
