import { describe, test, expect } from "bun:test";
import { screen, render, waitFor } from "@testing-library/react";
import { createWrapper } from "./test-utils";
import { Main } from "./page";
import { DBWord } from "./types";
import { mockFetch } from "../testing-preload";
import { beforeEach } from "bun:test";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";

const mockWords: DBWord[] = [
    {
        word: "apple",
        status: "TO_LEARN",
        raw: {
            word: "apple",
            results: [
                {
                    definition:
                        "The round fruit of a tree of the rose family, which typically has thin red or green skin and crisp flesh.",
                    partOfSpeech: "noun",
                    synonyms: ["pome", "malus"],
                    examples: [
                        "I ate an apple for breakfast",
                        "The orchard grows over 50 varieties of apples",
                    ],
                },
            ],
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
    {
        word: "date",
        status: "TO_LEARN",
        raw: {
            word: "date",
            results: [],
            pronunciation: { all: "dayt" },
        },
        ai_definition: null,
        created_at: new Date().toISOString(),
    },
    {
        word: "elderberry",
        status: "NONE",
        raw: {
            word: "elderberry",
            results: [],
            pronunciation: { all: "el-der-ber-ee" },
        },
        ai_definition: null,
        created_at: new Date().toISOString(),
    },
    {
        word: "fig",
        status: "LEARNED",
        raw: {
            word: "fig",
            results: [],
            pronunciation: { all: "fig" },
        },
        ai_definition: null,
        created_at: new Date().toISOString(),
    },
    {
        word: "grape",
        status: "NONE",
        raw: {
            word: "grape",
            results: [],
            pronunciation: { all: "grayp" },
        },
        ai_definition: null,
        created_at: new Date().toISOString(),
    },
    {
        word: "honeydew",
        status: "TO_LEARN",
        raw: {
            word: "honeydew",
            results: [],
            pronunciation: { all: "huhn-ee-doo" },
        },
        ai_definition: null,
        created_at: new Date().toISOString(),
    },
    {
        word: "kiwi",
        status: "LEARNED",
        raw: {
            word: "kiwi",
            results: [],
            pronunciation: { all: "kee-wee" },
        },
        ai_definition: null,
        created_at: new Date().toISOString(),
    },
];

describe("word definitions", () => {
    let Wrapper: React.FC<{ children: React.ReactNode }>;

    beforeEach(() => {
        // Mock the fetch implementation
        mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
            // Handle both string and URL inputs
            const urlStr = input.toString();
            const path = urlStr.startsWith("/")
                ? urlStr
                : new URL(urlStr).pathname;

            if (path === "/api/words/one") {
                // Parse query params from string URL
                const params = new URLSearchParams(urlStr.split("?")[1] || "");
                const word = params.get("word");
                const wordData = mockWords.find((w) => w.word === word);
                return new Response(JSON.stringify(wordData), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            }

            if (path === "/api/words/all") {
                return new Response(JSON.stringify(mockWords), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            }

            // Default response for other endpoints
            return new Response(null, { status: 404 });
        });

        Wrapper = createWrapper();
    });

    test("should display definitions for word passed via query params", async () => {
        // Set initial query param
        window.history.pushState({}, "", "/?word=apple");

        // render(
        //     <Wrapper>
        //         <Main />
        //     </Wrapper>,
        // );
        render(
            <Wrapper>
                <Main />
            </Wrapper>,
            {
                wrapper: withNuqsTestingAdapter({
                    searchParams: "?word=apple",
                }),
            },
        );

        // Wait for definitions to load
        await waitFor(() => {
            expect(
                screen.getByTestId("definitions-container"),
            ).toBeInTheDocument();

            // Verify definitions content
            expect(
                screen.getByText(
                    "The round fruit of a tree of the rose family",
                ),
            ).toBeInTheDocument();
            expect(screen.getByText("noun")).toBeInTheDocument();
            expect(
                screen.getByText("I ate an apple for breakfast"),
            ).toBeInTheDocument();

            // Verify word is in the query params
            expect(window.location.search).toContain("word=apple");
        });
    });
});

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
            const wordElements = screen.getAllByTestId("word");
            const displayedWords = wordElements.map((el) => el.textContent);

            // Verify sorting order:
            // 1. NONE status first (elderberry)
            // 2. TO_LEARN next (apple, date)
            // 3. LEARNED last (banana, fig)
            // All alphabetically within their groups
            expect(displayedWords).toEqual([
                "elderberry", // NONE (alphabetically first)
                "grape", // NONE
                "apple", // TO_LEARN
                "date", // TO_LEARN
                "honeydew", // TO_LEARN
                "banana", // LEARNED
                "fig", // LEARNED
                "kiwi", // LEARNED
            ]);
        });
    });
});
