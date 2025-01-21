import { afterEach, mock } from "bun:test";
import { NextRouter } from "next/router";

export const mockFetch = mock();

// Mock Next.js router
mock.module("next/router", () => ({
    useRouter: () =>
        ({
            pathname: "/",
            route: "/",
            query: {},
            asPath: "/",
        }) as NextRouter,
}));

global.fetch = mockFetch;
mock.module("node-fetch", () => mockFetch);

afterEach(() => {
    mockFetch.mockReset();
});
