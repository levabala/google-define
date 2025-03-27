"use client";

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clone, isNonNullish, sample, shuffle, take } from "remeda";
import { useWordsAllQuery } from "@/app/hooks/useWordsAllQuery";
import { Button, buttonVariants } from "@/components/ui/button";
import { generateRandomWord } from "@/app/utils";
import { Definition, Word } from "@/app/types";
import { useTRPC } from "@/app/trpc/client";
import { useQueryState } from "nuqs";
import { Home } from "lucide-react";
import { cn } from "@/utils/cn";
import Link from "next/link";

type TrainingSetConfig = ReturnType<
    typeof useTRPC
>["pickWordsToTrain"]["~types"]["input"];

const TARGET_WORDS_COUNT_PER_TRAINING = 20;

const setConfigs = {
    balanced: {
        wordsCountSets: {
            learned: 1,
            sets: [
                {
                    count: TARGET_WORDS_COUNT_PER_TRAINING,
                    triesMin: 4,
                },
                {
                    count: TARGET_WORDS_COUNT_PER_TRAINING / 2,
                    successRateMax: 0.7,
                    triesMin: 4,
                },
                {
                    count: TARGET_WORDS_COUNT_PER_TRAINING / 2,
                    successRateMax: 0.3,
                    triesMin: 4,
                },
                {
                    count: TARGET_WORDS_COUNT_PER_TRAINING / 4,
                    triesMax: 3,
                },
            ],
        },
    },
    random: {
        wordsCountSets: {
            learned: 0,
            sets: [
                {
                    count: TARGET_WORDS_COUNT_PER_TRAINING,
                },
            ],
        },
    },
} satisfies Record<string, Omit<TrainingSetConfig, "seed">>;

type WordWithDefinition = Omit<Word, "aiDefinition"> & {
    aiDefinition: NonNullable<Word["aiDefinition"]>;
};

function isWordWithDefinition(word: Word): word is WordWithDefinition {
    return Boolean(word.aiDefinition);
}

type QuizState = {
    targetWordIndex: number;
    targetWord: Word;
    targetDefinition: Definition;
    definitionVariants: Array<{
        word: Word;
        definition: Definition;
    }>;
};

export default function Page() {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const wordsAll = useWordsAllQuery();
    const [seed, setSeed] = useQueryState("seed", { defaultValue: "default" });

    const { data: wordsToTrainMain, isFetching: isFetchingWordsToTrainMain } =
        useQuery(
            trpc.pickWordsToTrain.queryOptions(
                { ...setConfigs.balanced, seed },
                { retry: 0 },
            ),
        );
    const { data: wordsToTrainAny, isFetching: isFetchingWordsToTrainAny } =
        useQuery(
            trpc.pickWordsToTrain.queryOptions(
                { ...setConfigs.random, seed },
                { retry: 0 },
            ),
        );

    const potentialWords = useMemo(() => {
        if (!wordsToTrainMain || !wordsToTrainAny) {
            return null;
        }

        const potentialWords = shuffle(
            Object.values({
                ...wordsToTrainMain
                    .map((word) =>
                        wordsAll.data?.find(
                            (wordInner) => wordInner.word === word?.word,
                        ),
                    )
                    .filter(isNonNullish)
                    .filter((word) => word.status !== "LEARNED")
                    .filter(isWordWithDefinition)
                    .reduce<Record<string, WordWithDefinition>>((acc, val) => {
                        acc[val.word] = val;
                        return acc;
                    }, {}),
                ...wordsToTrainAny
                    .map((word) =>
                        wordsAll.data?.find(
                            (wordInner) => wordInner.word === word?.word,
                        ),
                    )
                    .filter(isNonNullish)
                    .filter((word) => word.status !== "LEARNED")
                    .filter(isWordWithDefinition)
                    .slice(
                        0,
                        TARGET_WORDS_COUNT_PER_TRAINING -
                            wordsToTrainMain.length,
                    )
                    .reduce<Record<string, WordWithDefinition>>((acc, val) => {
                        acc[val.word] = val;
                        return acc;
                    }, {}),
            }),
        );

        if (!potentialWords.length) {
            return null;
        }

        console.log({
            potentialWords,
            wordsToTrainMain,
            wordsToTrainAny,
        });

        return potentialWords;
    }, [wordsAll.data, wordsToTrainAny, wordsToTrainMain]);

    const [quizState, setQuizState] = useState<QuizState | null>(null);

    const getNextQuizState = useCallback(
        (prevState: QuizState | null): QuizState | null => {
            console.log("prevState, potentialWords", prevState, potentialWords);
            if (!potentialWords) {
                return null;
            }

            for (
                let targetWordIndex = (prevState?.targetWordIndex ?? -1) + 1;
                targetWordIndex < potentialWords.length;
                targetWordIndex++
            ) {
                const targetWord = potentialWords[targetWordIndex];

                for (const targetDefinition of targetWord.aiDefinition) {
                    const potentialDefinitions: Array<{
                        definition: Definition;
                        word: Word;
                    }> = [];
                    for (const word of potentialWords) {
                        if (word === targetWord || !word.aiDefinition) {
                            continue;
                        }

                        const definition = sample(
                            word.aiDefinition.filter(
                                (definition) =>
                                    definition.partOfSpeech ===
                                    targetDefinition.partOfSpeech,
                            ),
                            1,
                        )[0];

                        if (!definition) {
                            continue;
                        }

                        potentialDefinitions.push({ definition, word });
                    }

                    if (!potentialDefinitions.length) {
                        continue;
                    }

                    const result: QuizState = {
                        targetWord,
                        targetWordIndex,
                        targetDefinition,
                        definitionVariants: take(potentialDefinitions, 3).map(
                            ({ word, definition }) => {
                                return {
                                    word,
                                    definition: definition,
                                };
                            },
                        ),
                    };

                    return result;
                }
            }

            return null;
        },
        [potentialWords],
    );

    useLayoutEffect(() => {
        if (!potentialWords) {
            return;
        }

        setQuizState(getNextQuizState(null));
    }, [potentialWords, getNextQuizState]);

    useEffect(() => console.log(quizState), [quizState]);

    const [definitionChoosen, setDefinitionChoosen] = useState<string | null>(
        null,
    );

    const recordQuizChoice = useMutation(
        trpc.recordQuizChoice.mutationOptions(),
    );

    const [successfullWordGuesses, setSuccessfullWordGuesses] = useState<
        Array<{ word: string; definition: string }>
    >([]);

    const chooseDefinition = (definition: string) => {
        if (!quizState) {
            return;
        }

        const isSuccess = quizState.targetDefinition.definition === definition;

        if (isSuccess) {
            setSuccessfullWordGuesses((prev) => [
                ...prev,
                { word: quizState.targetWord.word, definition },
            ]);
        }

        setDefinitionChoosen(definition);
        recordQuizChoice.mutate({
            definition,
            isSuccess,
            word: quizState.targetWord.word,
        });
    };

    const definitionOptions = useMemo(
        () =>
            quizState
                ? shuffle([
                      {
                          word: quizState.targetWord,
                          definition: quizState.targetDefinition,
                      },
                      ...quizState.definitionVariants,
                  ])
                : [],
        [quizState],
    );

    const trainingStateInfoBase = useMemo(() => {
        if (!wordsToTrainMain || !wordsToTrainAny) {
            return {};
        }

        const acc: Record<
            string,
            {
                totalCount: number;
                successCount: number;
            }
        > = {};
        for (const word of [...wordsToTrainMain, ...wordsToTrainAny]) {
            if (!word) {
                continue;
            }

            const { totalCount, successCount } = word;
            acc[word.word] = {
                totalCount,
                successCount,
            };
        }

        return acc;
    }, [wordsToTrainAny, wordsToTrainMain]);

    const trainingStatInfoAll = useMemo(() => {
        const base = clone(trainingStateInfoBase);

        for (const successfulGuess of successfullWordGuesses) {
            base[successfulGuess.word].successCount++;
        }

        return base;
    }, [successfullWordGuesses, trainingStateInfoBase]);

    const trainingStatInfo =
        quizState && trainingStatInfoAll[quizState.targetWord.word];

    return (
        <>
            <div className="flex flex-col grow gap-2 justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between gap-1 items-baseline">
                        <h3 className="text-xl inline">
                            {quizState?.targetWord.word || "no word huh"}
                        </h3>
                        <Link
                            prefetch
                            href="/vocabulary"
                            shallow
                            className={buttonVariants({
                                variant: "outline",
                                size: "sm",
                            })}
                        >
                            <Home />
                        </Link>
                    </div>
                    <div className={cn("text-sm")}>
                        {trainingStatInfo
                            ? `${trainingStatInfo.successCount}/${trainingStatInfo.totalCount}`
                            : "Loading..."}
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    {quizState && (
                        <>
                            {definitionOptions.map(({ definition }) => {
                                const isChoosen =
                                    definitionChoosen === definition.definition;
                                const isCorrectChoice =
                                    definition === quizState.targetDefinition;

                                let backgroundCn = null;
                                if (isChoosen) {
                                    if (isCorrectChoice) {
                                        backgroundCn = "bg-success";
                                    } else {
                                        backgroundCn = "bg-destructive";
                                    }
                                } else if (definitionChoosen) {
                                    if (isCorrectChoice) {
                                        backgroundCn = "bg-secondary";
                                    } else {
                                        backgroundCn = null;
                                    }
                                }

                                const isHighlighted =
                                    isChoosen ||
                                    (isCorrectChoice &&
                                        Boolean(definitionChoosen));

                                return (
                                    <Button
                                        key={definition.definition}
                                        className={cn(
                                            "whitespace-normal h-auto",
                                            backgroundCn,
                                            isHighlighted && "!opacity-100",
                                        )}
                                        variant="outline"
                                        onClick={() =>
                                            chooseDefinition(
                                                definition.definition,
                                            )
                                        }
                                        disabled={Boolean(definitionChoosen)}
                                    >
                                        {definition.definition}
                                    </Button>
                                );
                            })}
                        </>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <div
                        className={cn(
                            "text-xs text-muted-foreground invisible",
                            recordQuizChoice.isPending && "visible",
                        )}
                    >
                        Saving...
                    </div>
                    <Button
                        onClick={() => {
                            if (!quizState) {
                                setSeed(generateRandomWord(6));
                                return;
                            }

                            setQuizState(getNextQuizState(quizState));
                            setDefinitionChoosen(null);
                        }}
                        isLoading={
                            isFetchingWordsToTrainAny ||
                            isFetchingWordsToTrainMain
                        }
                    >
                        {quizState ? "next" : "load a new set"}
                    </Button>
                </div>
            </div>
        </>
    );
}
