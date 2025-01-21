import { afterEach, mock } from "bun:test";

export const mockFetch = mock();

// Mock Next.js navigation
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
