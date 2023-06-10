const path = require("path");
const process = require("process");
const pathBuilder = (subpath) => path.join(process.cwd(), subpath);

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com"],
    minimumCacheTTL: 2592000, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "**/.*/**",
      },
      {
        protocol: "http",
        hostname: "**",
        pathname: "**/.*/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "**/.*/**/.*/**",
      },
      {
        protocol: "http",
        hostname: "**",
        pathname: "**/.*/**/.*/**",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias["@/utils"] = pathBuilder("utils");
    config.resolve.alias["@/styles"] = pathBuilder("styles");
    config.resolve.alias["@/store"] = pathBuilder("store");
    config.resolve.alias["@/components"] = pathBuilder("components");
    config.output["sourcePrefix"] = "";
    
    return config;
  }
};

module.exports = nextConfig;
