import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

loadEnvConfig(process.cwd());

const nextConfig: NextConfig = {
    experimental: {
        staleTimes: {
            dynamic: 2592000,
            static: 2592000,
        },
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    env: {
        NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
    },
    generateEtags: true,
};

export default nextConfig;
