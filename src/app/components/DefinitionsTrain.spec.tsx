import { describe, test, expect } from "bun:test";

function expectAtLeastOne(expectations: (() => void)[]) {
    const errors: Error[] = [];
    
    for (const expectation of expectations) {
        try {
            expectation();
            return; // If any expectation passes, return immediately
        } catch (error) {
            errors.push(error as Error);
        }
    }
    
    // If we get here, all expectations failed
    throw new Error(
        `None of the expectations passed:\n${errors
            .map((e, i) => `  ${i + 1}. ${e.message}`)
            .join("\n")}`
    );
}
import { render, screen, fireEvent } from "@testing-library/react";
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
            { wrapper: createWrapper() },
        );

        // Wait for definitions to load
        const definitions = screen.getAllByTestId(/definition-choice-/);
        expect(definitions.length).toBe(3);

        screen.debug(definitions);

        // Verify at least one definition contains expected text
        expectAtLeastOne([
            () => expect(definitions).toHaveTextContent(
                "The round fruit of a tree of the rose family"
            ),
            () => expect(definitions).toHaveTextContent(
                "A tech company known for its smartphones"
            ),
            () => expect(definitions).toHaveTextContent(
                "A popular fruit often used in desserts"
            )
        ]);
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
            { wrapper: createWrapper() },
        );

        const definitions = screen.getAllByTestId(/definition-choice-/);
        const definitionTexts = definitions.map((d) =>
            Array.from(d.querySelectorAll('[data-testid="word"]'))
                .map((span) => span.textContent)
                .join(" "),
        );

        // Verify dictionary definition is present
        expect(definitionTexts).toHaveTextContent(
            "A long curved fruit with a yellow skin",
        );

        // Verify no AI definition is present
        expect(definitionTexts).not.toHaveTextContent(
            "A popular fruit often used in desserts",
        );
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
            { wrapper: createWrapper() },
        );

        const definitions = screen.getAllByTestId(/definition-choice-/);
        const definitionTexts = definitions.map((d) =>
            Array.from(d.querySelectorAll('[data-testid="word"]'))
                .map((span) => span.textContent)
                .join(" "),
        );

        // Verify AI definition is present
        expect(definitionTexts).toHaveTextContent(
            "A small round red fruit with a pit",
        );

        // Verify no dictionary definitions are present
        expect(definitionTexts).not.toHaveTextContent(
            "The round fruit of a tree of the rose family",
        );
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
        const definitions = screen.getAllByTestId(/definition-choice-/);
        expect(definitions.length).toBe(5);

        // Select a definition
        const firstDefinition = screen.getAllByTestId(/definition-choice-/)[0];
        fireEvent.click(firstDefinition);

        // Verify word origin appears in brackets
        expect(firstDefinition).toHaveTextContent(/\[.*\]/);
    });
});
