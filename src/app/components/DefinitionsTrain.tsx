import { useState, useMemo, useRef, useEffect } from 'react';
import { DBWord, WordData } from '../types';
import { Definition } from './Definition';
import { ToggleSwitch } from './ToggleSwitch';

type DefinitionsTrainProps = {
    results: WordData['results'];
    wordsAll?: DBWord[];
    word: string | null;
    onWordClick: (word: string, addToLearn?: boolean) => void;
    onSuccess?: (definition: string) => void;
    onFailure?: (definition: string) => void;
    onNext?: () => void;
};

type Mode = 'answer' | 'word';

export function DefinitionsTrain({
    results,
    wordsAll,
    word,
    onWordClick,
    onSuccess,
    onFailure,
    onNext,
}: DefinitionsTrainProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [mode, setMode] = useState<Mode>('answer');
    const nextButtonRef = useRef<HTMLButtonElement>(null);

    // Calculate prevailing partOfSpeech and get the first matching definition
    const { prevailingPos, correctDefinition } = useMemo(() => {
        if (!results || results.length === 0) {
            return { prevailingPos: 'unknown', correctDefinition: { definition: '', partOfSpeech: null } };
        }

        // Count occurrences of each partOfSpeech
        const posCount = results.reduce<Record<string, number>>(
            (acc, result) => {
                const pos = result.partOfSpeech || 'unknown';
                acc[pos] = (acc[pos] || 0) + 1;
                return acc;
            },
            {}
        );

        // Find the most common partOfSpeech
        const prevailingPos = Object.entries(posCount).reduce((a, b) =>
            b[1] > a[1] ? b : a,
        )[0];

        // Get first 3 definitions
        const firstThreeDefinitions = results.slice(0, 3);
        if (firstThreeDefinitions.length === 0) {
            return { prevailingPos, correctDefinition: results[0] };
        }

        // Get definitions with the prevailing partOfSpeech
        const matchingDefs = firstThreeDefinitions.filter(
            r => r.partOfSpeech === prevailingPos,
        );

        // Choose randomly from matching definitions, or from first three if no matches
        const defsToChooseFrom = matchingDefs.length > 0 ? matchingDefs : firstThreeDefinitions;
        const correctDef = defsToChooseFrom[Math.floor(Math.random() * defsToChooseFrom.length)];

        return { prevailingPos, correctDefinition: correctDef };
    }, [results]);

    // Generate 4 random definitions plus the correct one
    const definitionChoices = useMemo(() => {
        if (!wordsAll || wordsAll.length === 0 || !word) {
            return [];
        }

        // Get all definitions grouped by word
        const allDefinitions = wordsAll.flatMap(word => {
            if (!word.raw.results || word.raw.results.length === 0) {
                return [];
            }

            // First, find the prevailing pos for this word
            const posCount = word.raw.results.reduce<Record<string, number>>(
                (acc, result) => {
                    const pos = result.partOfSpeech || 'unknown';
                    acc[pos] = (acc[pos] || 0) + 1;
                    return acc;
                },
                {}
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
        });

        // First try to get definitions with matching partOfSpeech
        const matchingDefinitions = allDefinitions.filter(
            def =>
                def.fromWord !== word &&
                def.partOfSpeech === prevailingPos &&
                !def.definition
                    .toLowerCase()
                    .includes(word?.toLowerCase() || ''),
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
                    def.fromWord !== word &&
                    def.partOfSpeech !== prevailingPos &&
                    !def.definition
                        .toLowerCase()
                        .includes(word?.toLowerCase() || ''),
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
            fromWord: word as string,
        });

        return choices;
    }, [wordsAll, correctDefinition, word, prevailingPos]);

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
            'p-2 mb-2 w-full text-left border rounded transition-colors';

        if (!hasAnswered && mode === 'answer') {
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

    // Scroll to next button when definitions change or when answered
    useEffect(() => {
        if (nextButtonRef.current) {
            const offset = 100; // 100px gap
            const elementPosition =
                nextButtonRef.current.getBoundingClientRect().top;
            const offsetPosition =
                elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    }, [hasAnswered, definitionChoices]);

    return (
        <div className={`flex flex-col gap-1 transition-opacity duration-300`}>
            <div className="flex">
                <ToggleSwitch
                    checked={mode === 'word'}
                    onChange={checked => setMode(checked ? 'word' : 'answer')}
                    leftLabel="Answer Mode"
                    rightLabel="Word Mode"
                />
            </div>
            <div className="text-m font-bold text-white">{word} is:</div>
            {definitionChoices.map((def, index) => (
                <button
                    key={`${def.definition}-${index}`}
                    onClick={() => mode === 'answer' && handleSelect(index)}
                    className={`${getButtonClass(index)} transition-all duration-300 text-white ${
                        mode === 'word'
                            ? 'cursor-default border-gray-700'
                            : 'border-gray-600'
                    }`}
                    disabled={hasAnswered || mode === 'word'}
                >
                    <div className="flex justify-between items-start gap-1">
                        <Definition
                            result={def}
                            wordsAll={wordsAll}
                            textSourceSubmitted={word}
                            onWordClick={onWordClick}
                            hideExamples
                            disableWordClick={mode === 'answer'}
                            word={textSourceSubmitted || ''}
                            useMutationAIDefinition={() => ({
                                mutate: () => {},
                                isPending: false
                            })}
                        />
                        <span
                            className={`text-white font-bold whitespace-nowrap ${!hasAnswered ? 'invisible' : 'visible'}`}
                        >
                            {def.fromWord && `[${def.fromWord}]`}
                        </span>
                    </div>
                </button>
            ))}

            <button
                ref={nextButtonRef}
                onClick={async () => {
                    if (!hasAnswered) return;
                    setSelectedIndex(null);
                    setHasAnswered(false);
                    onNext?.();
                }}
                className={`mt-4 p-2 rounded transition-colors flex items-center justify-center gap-2 ${
                    hasAnswered
                        ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                        : 'bg-blue-500/50 cursor-not-allowed'
                }`}
                disabled={!hasAnswered}
            >
                Next
            </button>
        </div>
    );
}
