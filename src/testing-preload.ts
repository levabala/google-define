import { afterEach, mock } from "bun:test";
import { NextRouter } from "next/router";

export const mockFetch = mock();

// Mock Next.js router and navigation
mock.module("next/router", () => ({
    useRouter: () => ({
        pathname: "/",
        route: "/",
        query: {},
        asPath: "/",
        push: () => {},
        replace: () => {},
        refresh: () => {},
    }) as NextRouter,
}));

mock.module("next/navigation", () => ({
    usePathname: () => "/",
    useRouter: () => ({
        push: () => {},
        replace: () => {},
        refresh: () => {},
    }),
}));

global.fetch = mockFetch;
mock.module("node-fetch", () => mockFetch);

afterEach(() => {
    mockFetch.mockReset();
});
