import { useState, useMemo } from 'react';
import { DBWord, WordData } from '../types';
import { Definition } from './Definition';

type DefinitionsTrainProps = {
    results: WordData['results'];
    wordsAll?: DBWord[];
    textSourceSubmitted: string | null;
    onWordClick: (word: string, addToLearn?: boolean) => void;
    onSuccess?: (definition: string) => void;
    onFailure?: (definition: string) => void;
    onNext?: () => void;
};

export function DefinitionsTrain({
    results,
    wordsAll,
    textSourceSubmitted,
    onWordClick,
    onSuccess,
    onFailure,
    onNext,
}: DefinitionsTrainProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);

    // Calculate prevailing partOfSpeech and get the first matching definition
    const { prevailingPos, correctDefinition } = useMemo(() => {
        // Count occurrences of each partOfSpeech
        const posCount = results.reduce(
            (acc, result) => {
                const pos = result.partOfSpeech || 'unknown';
                acc[pos] = (acc[pos] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );

        // Find the most common partOfSpeech
        const prevailingPos = Object.entries(posCount).reduce((a, b) =>
            b[1] > a[1] ? b : a,
        )[0];

        // Get the first definition with the prevailing partOfSpeech
        const correctDef =
            results.find(r => r.partOfSpeech === prevailingPos) || results[0];

        return { prevailingPos, correctDefinition: correctDef };
    }, [results]);

    // Generate 4 random definitions plus the correct one
    const definitionChoices = useMemo(() => {
        // Get all definitions grouped by word
        const allDefinitions =
            wordsAll?.flatMap(word => {
                // First, find the prevailing pos for this word
                const posCount = word.raw.results.reduce(
                    (acc, result) => {
                        const pos = result.partOfSpeech || 'unknown';
                        acc[pos] = (acc[pos] || 0) + 1;
                        return acc;
                    },
                    {} as Record<string, number>,
                );

                const wordPrevailingPos = Object.entries(posCount).reduce(
                    (a, b) => (b[1] > a[1] ? b : a),
                )[0];

                // Only return definitions that match the prevailing pos
                return word.raw.results
                    .filter(result => result.partOfSpeech === wordPrevailingPos)
                    .map(result => ({
                        ...result,
                        fromWord: word.word,
                    }));
            }) || [];

        // First try to get definitions with matching partOfSpeech
        const matchingDefinitions = allDefinitions.filter(
            def =>
                def.fromWord !== textSourceSubmitted &&
                def.partOfSpeech === prevailingPos,
        );

        // If we don't have enough matching definitions, include other parts of speech
        let randomDefinitions;
        if (matchingDefinitions.length >= 4) {
            randomDefinitions = matchingDefinitions
                .sort(() => Math.random() - 0.5)
                .slice(0, 4);
        } else {
            // Get all other definitions (regardless of partOfSpeech)
            const otherPosDefinitions = allDefinitions.filter(
                def =>
                    def.fromWord !== textSourceSubmitted &&
                    def.partOfSpeech !== prevailingPos,
            );

            // Combine matching and non-matching definitions
            const allAvailableDefinitions = [
                ...matchingDefinitions,
                ...otherPosDefinitions,
            ];

            randomDefinitions = allAvailableDefinitions
                .sort(() => Math.random() - 0.5)
                .slice(0, 4);
        }

        // Insert correct definition at random position
        const correctIndex = Math.floor(Math.random() * 5);
        const choices = [...randomDefinitions];
        choices.splice(correctIndex, 0, {
            ...correctDefinition,
            fromWord: textSourceSubmitted as string,
        });

        return choices;
    }, [wordsAll, correctDefinition, textSourceSubmitted, prevailingPos]);

    const handleSelect = (index: number) => {
        if (hasAnswered) return;

        setSelectedIndex(index);
        setHasAnswered(true);

        const isCorrect =
            definitionChoices[index].definition ===
            correctDefinition.definition;
        if (isCorrect) {
            onSuccess?.(correctDefinition.definition);
        } else {
            onFailure?.(definitionChoices[index].definition);
        }
    };

    const getButtonClass = (index: number) => {
        const baseClasses =
            'p-4 mb-2 w-full text-left border rounded transition-colors';

        if (!hasAnswered) {
            return `${baseClasses} hover:bg-gray-700`;
        }

        const isCorrect =
            definitionChoices[index].definition ===
            correctDefinition.definition;
        const isSelected = selectedIndex === index;

        if (isCorrect) {
            // Highlight correct answer with outline if wrong choice was made
            const shouldShowOutline = selectedIndex !== null && !isSelected;
            return `${baseClasses} ${
                isSelected
                    ? 'bg-green-600/50 hover:bg-green-600/60'
                    : shouldShowOutline
                      ? 'outline outline-2 outline-green-500'
                      : ''
            }`;
        }

        // Wrong answer
        return `${baseClasses} ${
            isSelected ? 'bg-red-600/50 hover:bg-red-600/60' : ''
        }`;
    };

    return (
        <div className="flex flex-col gap-2">
            {definitionChoices.map((def, index) => (
                <button
                    key={`${def.definition}-${index}`}
                    onClick={() => handleSelect(index)}
                    className={getButtonClass(index)}
                    disabled={hasAnswered}
                >
                    <div className="flex justify-between items-start gap-4">
                        <Definition
                            result={def}
                            wordsAll={wordsAll}
                            textSourceSubmitted={textSourceSubmitted}
                            onWordClick={onWordClick}
                            hideExamples
                        />
                        <span
                            className={`text-white font-bold whitespace-nowrap ${!hasAnswered ? 'invisible' : 'visible'}`}
                        >
                            {def.fromWord && `[${def.fromWord}]`}
                        </span>
                    </div>
                </button>
            ))}

            {hasAnswered && (
                <button
                    onClick={() => {
                        setSelectedIndex(null);
                        setHasAnswered(false);
                        onNext?.();
                    }}
                    className="mt-4 p-2 bg-blue-500 hover:bg-blue-600 rounded transition-colors"
                >
                    Next
                </button>
            )}
        </div>
    );
}
