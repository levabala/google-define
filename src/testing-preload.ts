import { afterEach, expect, mock } from "bun:test";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

export const mockFetch = mock();

global.fetch = mockFetch;
mock.module("node-fetch", () => mockFetch);

afterEach(() => {
    cleanup();
    mockFetch.mockReset();
});
