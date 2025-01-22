import { describe, test, expect } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { DefinitionsTrain } from "./DefinitionsTrain";
import { DBWord } from "../types";

function expectAny(expectations: (() => void)[]) {
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
            .join("\n")}`,
    );
}

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
        );

        // Wait for definitions to load
        const definitions = screen.getAllByTestId(/definition-choice-/);
        expect(definitions.length).toBe(3);

        const definitionsTrainContainer =
            screen.getByTestId("definitions-train");

        expectAny([
            () =>
                expect(definitionsTrainContainer).toHaveTextContent(
                    /The round fruit of a tree of the rose family/,
                ),
            () =>
                expect(definitionsTrainContainer).toHaveTextContent(
                    /A tech company known for its smartphones/,
                ),
            () =>
                expect(definitionsTrainContainer).toHaveTextContent(
                    /A popular fruit often used in desserts/,
                ),
        ]);

        expect(definitionsTrainContainer).toHaveTextContent(
            /A long curved fruit with a yellow skin/,
        );

        expectAny([
            () =>
                expect(definitionsTrainContainer).toHaveTextContent(
                    /A small round red fruit with a pit/,
                ),
        ]);
    });

    test("should be able to use dictionary definitions when AI definition is missing", async () => {
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
        );

        const definitionsTrainContainer =
            screen.getByTestId("definitions-train");

        expect(definitionsTrainContainer).toHaveTextContent(
            /A long curved fruit with a yellow skin/,
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
        );

        const definitionsTrainContainer =
            screen.getByTestId("definitions-train");

        expect(definitionsTrainContainer).toHaveTextContent(
            /A small round red fruit with a pit/,
        );
    });

    test("should show word origin in brackets after selection", async () => {
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
        );

        const firstDefinitionWord = screen.getAllByTestId(/definition-word/)[0];

        // Verify word origin appears in brackets
        expect(firstDefinitionWord).toHaveClass('invisible');

        fireEvent.click(firstDefinitionWord);

        // Verify word origin appears in brackets
        expect(firstDefinitionWord).not.toHaveClass('invisible');
    });
});
