import { afterEach, expect, mock } from "bun:test";

import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

import { configure } from "@testing-library/react";

configure({
    getElementError: (message) => {
        const error = new Error(message as string);
        error.name = "TestingLibraryElementError";
        return error;
    },
});

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
    cleanup();
    mockFetch.mockReset();
});
