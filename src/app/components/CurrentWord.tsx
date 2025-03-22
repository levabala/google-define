import { useShouldRequestAIDefinitionQueryState } from "../hooks/useShouldRequestAIDefinitionQueryState";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { AI_DEFINITION_EXPIRATION_DURATION_MS } from "../constants";
import { useCurrentWordStr } from "../hooks/useCurrentWordStr";
import { Attributes, useEffect, useLayoutEffect } from "react";
import { CurrentWordLayout } from "./CurrentWordLayout";
import { WordDefinitionsAI } from "./WordDefinitionsAI";
import { Button } from "@/components/ui/button";
import { areWordsEqual } from "../helpers";
import { useTRPC } from "../trpc/client";
import { Word } from "../types";

export const CurrentWord: React.FC<{ word: Word } & Attributes> = ({
    word,
}) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { setCurrentWordStr } = useCurrentWordStr();
    const { shouldRequestAIDefinition, setShouldRequestAIDefinition } =
        useShouldRequestAIDefinitionQueryState();

    useEffect(() => {
        console.log(word);
    }, [word]);

    const requestAIDefinition = useMutation(
        trpc.requestAIDefinition.mutationOptions({
            onSuccess: (aiDefinition) => {
                queryClient.setQueryData(trpc.getWordsAll.queryKey(), (prev) =>
                    prev?.map((wordInner) => {
                        if (!areWordsEqual(wordInner.word, word.word)) {
                            return wordInner;
                        }

                        return { ...wordInner, aiDefinition };
                    }),
                );
            },
        }),
    );

    const deleteWord = useMutation(
        trpc.deleteWord.mutationOptions({
            onSuccess: () => {
                queryClient.setQueryData(trpc.getWordsAll.queryKey(), (prev) =>
                    prev?.filter((wordInner) => wordInner.word !== word.word),
                );
                setCurrentWordStr(null);
            },
        }),
    );

    const wordUpdateIfLearned = useMutation(
        trpc.wordUpdateIfLearned.mutationOptions({
            onSuccess: (wordUpdated) => {
                queryClient.setQueryData(trpc.getWordsAll.queryKey(), (prev) =>
                    prev?.map((wordInner) =>
                        areWordsEqual(wordInner.word, word.word)
                            ? wordUpdated
                            : wordInner,
                    ),
                );
            },
        }),
    );

    const timePast = word.aiDefinitionRequestStartDate
        ? Date.now() - new Date(word.aiDefinitionRequestStartDate).valueOf()
        : null;
    const aiRequestAlreadyPending =
        !word.aiDefinition &&
        !!timePast &&
        timePast < AI_DEFINITION_EXPIRATION_DURATION_MS;

    useLayoutEffect(() => {
        if (shouldRequestAIDefinition) {
            requestAIDefinition.mutate({ wordStr: word.word });
            setShouldRequestAIDefinition(false);
        }
    }, [
        requestAIDefinition,
        setShouldRequestAIDefinition,
        shouldRequestAIDefinition,
        word.word,
    ]);

    const pronunciationsUnique = word.aiDefinition
        ?.filter((def) => def.pronunciation)
        .map((def) => def.pronunciation)
        ?.reduce((acc, pron) => {
            if (!pron) {
                return acc;
            }

            acc.add(pron);

            return acc;
        }, new Set<string>());

    const pronunciationMain =
        pronunciationsUnique?.size === 1
            ? pronunciationsUnique.values().next().value!
            : undefined;

    return (
        <CurrentWordLayout
            wordStr={word.word}
            addDate={new Date(word.createdAt)}
            pronunciation={pronunciationMain}
            deleteButtonProps={{
                onClick: () => deleteWord.mutate({ word: word.word }),
                isLoading: deleteWord.isPending,
            }}
            requestAIDefinitionButtonProps={{
                onClick: () =>
                    requestAIDefinition.mutate({ wordStr: word.word }),
                isLoading: requestAIDefinition.isPending,
                disabled: !word.aiDefinition,
            }}
            wordUpdateIfLearnedProps={{
                onClick: () =>
                    wordUpdateIfLearned.mutate({
                        word: word.word,
                        isLearned: word.status !== "LEARNED",
                    }),
                isLoading: wordUpdateIfLearned.isPending,
                pressed: word.status === "LEARNED",
            }}
        >
            {word.aiDefinition ? (
                <WordDefinitionsAI
                    definitions={word.aiDefinition}
                    shouldShowPronounciations={!pronunciationMain}
                />
            ) : (
                <div className="flex justify-center items-center grow">
                    <Button
                        onClick={() =>
                            requestAIDefinition.mutate({ wordStr: word.word })
                        }
                        isLoading={requestAIDefinition.isPending}
                        disabled={aiRequestAlreadyPending}
                    >
                        ai definition
                        {aiRequestAlreadyPending ? " (refresh to check)" : null}
                    </Button>
                </div>
            )}
        </CurrentWordLayout>
    );
};
