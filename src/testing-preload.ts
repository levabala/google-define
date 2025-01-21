import { afterEach, expect, mock } from "bun:test";

import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

export const mockFetch = mock();

// Mock Next.js navigation
mock.module("next/navigation", () => ({
    usePathname: () => "/",
    useRouter: () => ({
        push: () => {},
        replace: () => {},
        refresh: () => {},
    }),
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
}));

global.fetch = mockFetch;
mock.module("node-fetch", () => mockFetch);

afterEach(() => {
    mockFetch.mockReset();
});
