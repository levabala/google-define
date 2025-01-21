import { describe, test, expect } from "bun:test";
import { screen, render, waitFor } from "@testing-library/react";
import { createWrapper } from "./test-utils";
import { Main } from "./page";
import { DBWord } from "./types";
import { mockFetch } from "../testing-preload";

const mockWords: DBWord[] = [
    {
        word: "apple",
        status: "TO_LEARN",
        raw: {
            word: "apple",
            results: [],
            pronunciation: { all: "ap-uhl" },
        },
        ai_definition: null,
        created_at: new Date().toISOString(),
    },
    {
        word: "banana",
        status: "LEARNED",
        raw: {
            word: "banana",
            results: [],
            pronunciation: { all: "buh-nan-uh" },
        },
        ai_definition: null,
        created_at: new Date().toISOString(),
    },
    {
        word: "cherry",
        status: "HIDDEN",
        raw: {
            word: "cherry",
            results: [],
            pronunciation: { all: "cher-ee" },
        },
        ai_definition: null,
        created_at: new Date().toISOString(),
    },
];

describe("all words", () => {
    let Wrapper: React.FC<{ children: React.ReactNode }>;
    
    beforeEach(() => {
        // Mock the fetch implementation
        mockFetch.mockImplementation(async () => {
            return new Response(JSON.stringify(mockWords), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        });

        Wrapper = createWrapper();
    });

    test("should be fetched and displayed, except the hidden ones", async () => {
        render(
            <Wrapper>
                <Main />
            </Wrapper>,
        );

        // Wait for words to be loaded
        await waitFor(() => {
            // Check visible words
            expect(screen.getByText("apple")).toBeInTheDocument();
            expect(screen.getByText("banana")).toBeInTheDocument();

            // Check hidden word is not displayed
            expect(screen.queryByText("cherry")).not.toBeInTheDocument();
        });
    });

    test("should maintain status-based sorting order", async () => {
        render(
            <Wrapper>
                <Main />
            </Wrapper>,
        );

        // Wait for words to be loaded
        await waitFor(() => {
            const wordElements = screen.getAllByRole("listitem");
            const displayedWords = wordElements.map((el) => el.textContent);

            // Verify sorting order: TO_LEARN first, then LEARNED, alphabetically within each group
            expect(displayedWords).toEqual(["apple", "banana"]);
        });
    });
});
