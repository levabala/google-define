"use client";

import { useWordsAllQuery } from "@/app/hooks/useWordsAllQuery";
import { Button, buttonVariants } from "@/components/ui/button";
import { randomInteger, sample, shuffle, take } from "remeda";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Definition, Word } from "@/app/types";
import { useTRPC } from "@/app/trpc/client";
import { Home } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/utils/cn";
import Link from "next/link";

type WordWithDefinition = Omit<Word, "ai_definition"> & {
    ai_definition: NonNullable<Word["ai_definition"]>;
};
function isWordWithDefinition(word: Word): word is WordWithDefinition {
    return Boolean(word.ai_definition);
}

function Page() {
    const wordsAll = useWordsAllQuery();

    type QuizState = {
        targetWord: Word;
        targetDefinition: Definition;
        definitionVariants: Definition[];
    };

    const [quizState, setQuizState] = useState<QuizState | null>(() =>
        getNextQuizState(null),
    );

    function getNextQuizState(prevState: QuizState | null): QuizState | null {
        if (!wordsAll.data) {
            return null;
        }

        const wordsWithDefinition = wordsAll.data.filter(isWordWithDefinition);

        const potentialWords = prevState
            ? wordsWithDefinition.filter(
                  (word) => word.word !== prevState.targetWord.word,
              )
            : wordsWithDefinition;

        if (!potentialWords.length) {
            return null;
        }

        const targetWord =
            potentialWords[randomInteger(0, potentialWords.length - 1)];
        const targetDefinition = sample(targetWord.ai_definition, 1)[0]!;

        const potentialDefinitions: Definition[] = [];
        for (const word of potentialWords) {
            if (word === targetWord || !word.ai_definition) {
                continue;
            }

            const definition = sample(
                word.ai_definition.filter(
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
            return null;
        }

        return {
            targetWord,
            targetDefinition,
            definitionVariants: take(shuffle(potentialDefinitions), 3),
        };
    }

    useEffect(() => console.log(quizState), [quizState]);

    const [definitionChoosen, setDefinitionChoosen] = useState<string | null>(
        null,
    );

    const trpc = useTRPC();
    const recordQuizChoice = useMutation(
        trpc.recordQuizChoice.mutationOptions(),
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

    return (
        <>
            <div className="flex flex-col grow gap-2 justify-between">
                <div className="flex justify-between gap-1 items-baseline">
                    <h3 className="text-xl inline">
                        {quizState?.targetWord.word || "no word huh"}
                    </h3>
                    <Link
                        href="/vocabulary"
                        className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                        })}
                    >
                        <Home />
                    </Link>
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
export default dynamic(() => Promise.resolve(Page), { ssr: false });
