/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: "standalone",
  turbopack: {
    rules: {
      "*.wgsl": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
  transpilePackages: ["nanoid"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prxzhaldskupuefqkomv.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
