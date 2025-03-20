import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

loadEnvConfig(process.cwd());

const nextConfig: NextConfig = {
    experimental: {
        staleTimes: {
            dynamic: 99999999,
            static: 99999999,
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
};

export default nextConfig;
