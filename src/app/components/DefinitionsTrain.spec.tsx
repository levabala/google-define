import { describe, test, expect } from "bun:test";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { DefinitionsTrain } from "./DefinitionsTrain";
import { DBWord } from "../types";
import { createWrapper } from "../test-utils";

const mockWordsAll: DBWord[] = [
    {
        word: "apple",
        status: "TO_LEARN",
        raw: {
            word: "apple",
            results: [
                {
                    definition: "The round fruit of a tree of the rose family",
                    partOfSpeech: "noun",
                    examples: ["I ate an apple for breakfast"],
                },
                {
                    definition: "A tech company known for its smartphones",
                    partOfSpeech: "noun",
                    examples: ["Apple released a new iPhone"],
                },
            ],
            pronunciation: { all: "ap-uhl" },
        },
        ai_definition: {
            definition: "A popular fruit often used in desserts",
            partOfSpeech: "noun",
            examples: ["Apple pie is a classic American dessert"],
        },
        created_at: new Date().toISOString(),
    },
    {
        word: "banana",
        status: "TO_LEARN",
        raw: {
            word: "banana",
            results: [
                {
                    definition: "A long curved fruit with a yellow skin",
                    partOfSpeech: "noun",
                    examples: ["Monkeys love bananas"],
                },
            ],
            pronunciation: { all: "buh-nan-uh" },
        },
        ai_definition: null,
        created_at: new Date().toISOString(),
    },
    {
        word: "cherry",
        status: "TO_LEARN",
        raw: {
            word: "cherry",
            results: [],
            pronunciation: { all: "cher-ee" },
        },
        ai_definition: {
            definition: "A small round red fruit with a pit",
            partOfSpeech: "noun",
            examples: ["Cherry blossoms are beautiful in spring"],
        },
        created_at: new Date().toISOString(),
    },
    // Add more words as needed for testing
];

const mockWordWithBothDefinitions = mockWordsAll[0];
const mockWordWithOnlyDictionary = mockWordsAll[1];
const mockWordWithOnlyAI = mockWordsAll[2];

describe("DefinitionsTrain", () => {
    test("should use both dictionary and AI definitions when available", async () => {
        render(
            <DefinitionsTrain
                results={mockWordWithBothDefinitions.raw.results}
                word={mockWordWithBothDefinitions}
                wordsAll={mockWordsAll}
                onWordClick={() => {}}
                onSuccess={() => {}}
                onFailure={() => {}}
                onNext={() => {}}
            />,
            { wrapper: createWrapper() }
        );

        screen.debug();

        // Wait for definitions to load
        await waitFor(() => {
            const definitions = screen.getAllByTestId(/definition-choice-/);
            expect(definitions.length).toBe(5); // 4 random + 1 correct

            // Check that all definitions are present in the choices
            const definitionTexts = definitions.map((d) => d.textContent);

            // Verify dictionary definitions
            expect(definitionTexts).toContainEqual(
                expect.stringContaining(
                    "The round fruit of a tree of the rose family",
                ),
            );
            expect(definitionTexts).toContainEqual(
                expect.stringContaining(
                    "A tech company known for its smartphones",
                ),
            );

            // Verify AI definition
            expect(definitionTexts).toContainEqual(
                expect.stringContaining(
                    "A popular fruit often used in desserts",
                ),
            );
        });
    });

    test("should use only dictionary definitions when AI definition is missing", async () => {
        render(
            <DefinitionsTrain
                results={mockWordWithOnlyDictionary.raw.results}
                word={mockWordWithOnlyDictionary}
                wordsAll={mockWordsAll}
                onWordClick={() => {}}
                onSuccess={() => {}}
                onFailure={() => {}}
                onNext={() => {}}
            />,
            { wrapper: createWrapper() }
        );

        await waitFor(() => {
            const definitions = screen.getAllByTestId(/definition-choice-/);
            const definitionTexts = definitions.map((d) => d.textContent);

            // Verify dictionary definition is present
            expect(definitionTexts).toContainEqual(
                expect.stringContaining(
                    "A long curved fruit with a yellow skin",
                ),
            );

            // Verify no AI definition is present
            expect(definitionTexts).not.toContainEqual(
                expect.stringContaining(
                    "A popular fruit often used in desserts",
                ),
            );
        });
    });

    test("should use only AI definition when dictionary definitions are missing", async () => {
        render(
            <DefinitionsTrain
                results={mockWordWithOnlyAI.raw.results}
                word={mockWordWithOnlyAI}
                wordsAll={mockWordsAll}
                onWordClick={() => {}}
                onSuccess={() => {}}
                onFailure={() => {}}
                onNext={() => {}}
            />,
            { wrapper: createWrapper() }
        );

        await waitFor(() => {
            const definitions = screen.getAllByTestId(/definition-choice-/);
            const definitionTexts = definitions.map((d) => d.textContent);

            // Verify AI definition is present
            expect(definitionTexts).toContainEqual(
                expect.stringContaining("A small round red fruit with a pit"),
            );

            // Verify no dictionary definitions are present
            expect(definitionTexts).not.toContainEqual(
                expect.stringContaining(
                    "The round fruit of a tree of the rose family",
                ),
            );
        });
    });

    test("should show word origin in brackets after selection", async () => {
        render(
            <DefinitionsTrain
                results={mockWordWithBothDefinitions.raw.results}
                word={mockWordWithBothDefinitions}
                onWordClick={() => {}}
                onSuccess={() => {}}
                onFailure={() => {}}
                onNext={() => {}}
            />,
            { wrapper: createWrapper() },
        );

        // Wait for definitions to load
        await waitFor(() => {
            const definitions = screen.getAllByTestId(/definition-choice-/);
            expect(definitions.length).toBe(5);
        });

        // Select a definition
        const firstDefinition = screen.getAllByTestId(/definition-choice-/)[0];
        fireEvent.click(firstDefinition);

        // Verify word origin appears in brackets
        await waitFor(() => {
            expect(firstDefinition).toHaveTextContent(/\[.*\]/);
        });
    });
});
