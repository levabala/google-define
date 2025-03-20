import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        staleTimes: {
            dynamic: Infinity,
            static: Infinity,
        },
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
};

export default nextConfig;
