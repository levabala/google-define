import { describe, test, expect } from "bun:test";
import {
    screen,
    render,
    waitFor,
    fireEvent,
    within,
} from "@testing-library/react";
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
                        "The round fruit of a tree of the rose family, which typically has thin red or green skin and crisp flesh. also, apple IS banana",
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

describe("scenarios", () => {
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

            // Handle other endpoints
            return new Response(null, { status: 404 });
        });

        Wrapper = createWrapper();
    });

    describe("word definitions", () => {
        test("should display definitions for word passed via query params", async () => {
            // Set initial query param
            window.history.pushState({}, "", "/?word=apple");

            render(
                <Wrapper>
                    <Main />
                </Wrapper>,
                {
                    wrapper: withNuqsTestingAdapter({
                        searchParams: new URLSearchParams({ word: "apple" }),
                    }),
                },
            );

            // Wait for definitions to load
            await waitFor(() => {
                expect(
                    screen.getByTestId("definitions-container"),
                ).toBeInTheDocument();

                // Verify definitions content by checking the container's text content
                const definitionContainer = screen.getByTestId(
                    "definitions-container",
                );
                expect(definitionContainer).toHaveTextContent(
                    /noun.*The round fruit of a tree of the rose family.*I ate an apple for breakfast/,
                );
            });
        });
    });

    describe("word selection", () => {
        test("clicking word in WordsAll updates current word and query param", async () => {
            const Wrapper = createWrapper();
            render(
                <Wrapper>
                    <Main />
                </Wrapper>,
                {
                    wrapper: withNuqsTestingAdapter(),
                },
            );

            // Wait for words to load
            await waitFor(() => {
                expect(screen.getByText("apple")).toBeInTheDocument();
            });

            // Click on a word
            const appleWord = within(screen.getByTestId("words-all")).getByText(
                "apple",
            );
            fireEvent.click(appleWord);

            // Verify definitions loaded
            await waitFor(() => {
                const definitionContainer = screen.getByTestId(
                    "definitions-container",
                );
                expect(definitionContainer).toHaveTextContent(
                    /noun.*The round fruit of a tree of the rose family.*I ate an apple for breakfast/,
                );
            });
        });

        test("clicking word in Definitions updates current word and query param", async () => {
            const Wrapper = createWrapper();
            render(
                <Wrapper>
                    <Main />
                </Wrapper>,
                {
                    wrapper: withNuqsTestingAdapter({
                        searchParams: new URLSearchParams({ word: "apple" }),
                    }),
                },
            );

            // Wait for definitions to load
            await waitFor(() => {
                expect(
                    screen.getByTestId("definitions-container"),
                ).toBeInTheDocument();
            });

            // Find and click a word in the definition
            const definitionWord = within(
                screen.getByTestId("definitions-container"),
            ).getByText("banana");
            fireEvent.click(definitionWord);

            // Verify new definitions loaded
            await waitFor(() => {
                expect(
                    screen.getByTestId("definitions-container"),
                ).toBeInTheDocument();
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
                {
                    wrapper: withNuqsTestingAdapter(),
                },
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
                {
                    wrapper: withNuqsTestingAdapter(),
                },
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

    describe("word status transitions", () => {
        // test("should transition word to TO_LEARN status and update sorting", async () => {
        //     const Wrapper = createWrapper();
        //     render(
        //         <Wrapper>
        //             <Main />
        //         </Wrapper>,
        //         {
        //             wrapper: withNuqsTestingAdapter(),
        //         },
        //     );

        //     // Wait for initial words to load
        //     await waitFor(() => {
        //         expect(screen.getByText("elderberry")).toBeInTheDocument();
        //     });

        //     // Mock the status update endpoint
        //     mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
        //         const urlStr = input.toString();
        //         const path = urlStr.startsWith("/")
        //             ? urlStr
        //             : new URL(urlStr).pathname;

        //         if (path === "/api/words/one" && input instanceof Request && input.method === "PUT") {
        //             // Update the mock word's status
        //             const updatedWord = mockWords.find(w => w.word === "elderberry");
        //             if (updatedWord) {
        //                 updatedWord.status = "TO_LEARN";
        //             }
        //             return new Response(JSON.stringify(updatedWord), {
        //                 status: 200,
        //                 headers: {
        //                     "Content-Type": "application/json",
        //                 },
        //             });
        //         }

        //         return new Response(null, { status: 404 });
        //     });

        //         const definitionContainer = screen.getByTestId(
        //             "definitions-container",
        //         );

        //     const toLearnButton = within(definitionContainer).getByRole('button', { name: /to learn/i });

        //     // Click the TO_LEARN button
        //     fireEvent.click(toLearnButton);

        //     // Wait for the word to move in the sorted list
        //     await waitFor(() => {
        //         const wordElements = screen.getAllByTestId("word");
        //         const displayedWords = wordElements.map((el) => el.textContent);

        //         // Verify elderberry moved from NONE section to TO_LEARN section
        //         // while maintaining alphabetical order within groups
        //         expect(displayedWords).toEqual([
        //             "grape", // NONE
        //             "apple", // TO_LEARN
        //             "date", // TO_LEARN
        //             "elderberry", // TO_LEARN (moved here)
        //             "honeydew", // TO_LEARN
        //             "banana", // LEARNED
        //             "fig", // LEARNED
        //             "kiwi", // LEARNED
        //         ]);
        //     });
        // });
    });

    describe("adding new words", () => {
        test("should add new word, update words-all, and maintain sorting", async () => {
            const Wrapper = createWrapper();
            render(
                <Wrapper>
                    <Main />
                </Wrapper>,
                {
                    wrapper: withNuqsTestingAdapter(),
                },
            );

            // Wait for initial words to load
            await waitFor(() => {
                expect(screen.getByText("apple")).toBeInTheDocument();
            });

            // Mock the add word endpoint
            mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
                const urlStr = input.toString();
                const path = urlStr.startsWith("/")
                    ? urlStr
                    : new URL(urlStr).pathname;

                if (path === "/api/words/one") {
                    const newWord: DBWord = {
                        word: "zucchini",
                        status: "NONE",
                        raw: {
                            word: "zucchini",
                            results: [
                                {
                                    definition: "A summer squash",
                                    partOfSpeech: "noun",
                                    examples: ["I grew zucchini in my garden"],
                                },
                            ],
                            pronunciation: { all: "zoo-kee-nee" },
                        },
                        ai_definition: null,
                        created_at: new Date().toISOString(),
                    };
                    return new Response(JSON.stringify(newWord), {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                }

                return new Response(null, { status: 404 });
            });

            // Find the input and add button
            const input = screen.getByTestId("word-input");
            const addButton = screen.getByTestId("search-button");

            // Add a new word
            fireEvent.change(input, { target: { value: "zucchini" } });
            fireEvent.click(addButton);

            // Wait for new word to appear in words-all
            await waitFor(() => {
                const definitionContainer = screen.getByTestId(
                    "definitions-container",
                );
                
                expect(
                    within(definitionContainer).getByText("zucchini"),
                ).toBeInTheDocument();
            });

            // Verify definitions loaded
            await waitFor(() => {
                const definitionContainer = screen.getByTestId(
                    "definitions-container",
                );
                expect(definitionContainer).toHaveTextContent(
                    /noun.*A summer squash.*I grew zucchini in my garden/,
                );
            });

            const wordElements = screen.getAllByTestId("word");
            const displayedWords = wordElements.map((el) => el.textContent);

            expect(displayedWords[2]).toBe("zucchini");
        });
    });
});
