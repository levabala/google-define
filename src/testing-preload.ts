import { afterEach, mock } from "bun:test";

export const mockFetch = mock();

global.fetch = mockFetch;
mock.module("node-fetch", () => mockFetch);

afterEach(() => {
    mockFetch.mockReset();
});
