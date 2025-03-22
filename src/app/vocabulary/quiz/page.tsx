"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWordsAllQuery } from "@/app/hooks/useWordsAllQuery";
import { Button, buttonVariants } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { Definition, Word } from "@/app/types";
import { sample, shuffle, take } from "remeda";
import { useTRPC } from "@/app/trpc/client";
import { Home } from "lucide-react";
import { cn } from "@/utils/cn";
import Link from "next/link";

type WordWithDefinition = Omit<Word, "aiDefinition"> & {
    aiDefinition: NonNullable<Word["aiDefinition"]>;
};
function isWordWithDefinition(word: Word): word is WordWithDefinition {
    return Boolean(word.aiDefinition);
}

export default function Page() {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const wordsAll = useWordsAllQuery();

    type QuizState = {
        targetWord: Word;
        targetDefinition: Definition;
        definitionVariants: Definition[];
        stateNext: QuizState | null;
    };

    const [quizState, setQuizState] = useState<QuizState | null>(() =>
        getNextQuizState(null),
    );

    function getNextQuizState(
        prevState: QuizState | null,
        disableNextStateCalculation?: boolean,
    ): QuizState | null {
        if (!wordsAll.data) {
            return null;
        }

        function calcNextInAdvanceAndPrefetch(stateCurrent: QuizState) {
            const stateNext = getNextQuizState(stateCurrent, true);

            if (stateNext) {
                queryClient.prefetchQuery(
                    trpc.getWordTrainingStat.queryOptions({
                        word: stateNext.targetWord.word,
                    }),
                );
            }

            return stateNext;
        }

        if (prevState?.stateNext) {
            const stateNextNext = calcNextInAdvanceAndPrefetch(
                prevState.stateNext,
            );
            return { ...prevState.stateNext, stateNext: stateNextNext };
        }

        const wordsWithDefinition = wordsAll.data.filter(isWordWithDefinition);

        const potentialWords = prevState
            ? wordsWithDefinition.filter(
                  (word) =>
                      word.word !== prevState.targetWord.word &&
                      word.status !== "LEARNED",
              )
            : wordsWithDefinition;

        if (!potentialWords.length) {
            return null;
        }

        for (const targetWord of shuffle(potentialWords)) {
            for (const targetDefinition of shuffle(targetWord.aiDefinition)) {
                const potentialDefinitions: Definition[] = [];
                for (const word of potentialWords) {
                    if (word === targetWord || !word.aiDefinition) {
                        continue;
                    }

                    const definition = sample(
                        word.aiDefinition.filter(
                            (definitions) =>
                                definitions.partOfSpeech ===
                                targetDefinition.partOfSpeech,
                        ),
                        1,
                    )[0];

                    if (!definition) {
                        continue;
                    }

                    potentialDefinitions.push(definition);
                }

                if (!potentialDefinitions.length) {
                    continue;
                }

                const result: QuizState = {
                    targetWord,
                    targetDefinition,
                    definitionVariants: take(shuffle(potentialDefinitions), 3),
                    stateNext: null,
                };

                if (!disableNextStateCalculation) {
                    const stateNext = calcNextInAdvanceAndPrefetch(result);
                    result.stateNext = stateNext;
                }

                return result;
            }
        }

        return null;
    }

    useEffect(() => console.log(quizState), [quizState]);

    const [definitionChoosen, setDefinitionChoosen] = useState<string | null>(
        null,
    );

    const recordQuizChoice = useMutation(
        trpc.recordQuizChoice.mutationOptions({
            onSuccess: (_, { isSuccess }) => {
                queryClient.setQueryData(
                    trpc.getWordTrainingStat.queryKey({
                        word: quizState?.targetWord.word,
                    }),
                    (prev) =>
                        prev
                            ? {
                                  successfulAttempts:
                                      prev.successfulAttempts +
                                      (isSuccess ? 1 : 0),
                                  totalAttempts: prev.totalAttempts + 1,
                              }
                            : undefined,
                );
            },
        }),
    );

    const chooseDefinition = (definition: string) => {
        if (!quizState) {
            return;
        }

        setDefinitionChoosen(definition);
        recordQuizChoice.mutate({
            definition,
            isSuccess: quizState.targetDefinition.definition === definition,
            word: quizState.targetWord.word,
        });
    };

    const definitionOptions = useMemo(
        () =>
            quizState
                ? shuffle([
                      quizState.targetDefinition,
                      ...quizState.definitionVariants,
                  ])
                : [],
        [quizState],
    );

    const trainingStat = useQuery(
        trpc.getWordTrainingStat.queryOptions(
            {
                word: quizState?.targetWord.word || "",
            },
            { enabled: Boolean(quizState) },
        ),
    );

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
                    <div
                        className={cn(
                            "text-sm",
                            trainingStat.isPending
                                ? "text-muted-foreground"
                                : "text-accent-foreground",
                        )}
                    >
                        {trainingStat.data
                            ? `${trainingStat.data.successfulAttempts}/${trainingStat.data.totalAttempts}`
                            : "loading..."}
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    {quizState && (
                        <>
                            {definitionOptions.map(({ definition }) => {
                                const isChoosen =
                                    definitionChoosen === definition;
                                const isCorrectChoice =
                                    definition ===
                                    quizState.targetDefinition.definition;

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
                                        key={definition}
                                        className={cn(
                                            "whitespace-normal h-auto",
                                            backgroundCn,
                                            isHighlighted && "!opacity-100",
                                        )}
                                        variant="outline"
                                        onClick={() =>
                                            chooseDefinition(definition)
                                        }
                                        disabled={Boolean(definitionChoosen)}
                                    >
                                        {definition}
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
                            setQuizState(getNextQuizState(quizState));
                            setDefinitionChoosen(null);
                        }}
                    >
                        next
                    </Button>
                </div>
            </div>
        </>
    );
}
