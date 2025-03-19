import { useShouldRequestAIDefinitionQueryState } from "../hooks/useShouldRequestAIDefinitionQueryState";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { AI_DEFINITION_EXPIRATION_DURATION_MS } from "../constants";
import { Attributes, useEffect, useLayoutEffect } from "react";
import { useCurrentWordStr } from "../hooks/useCurrentWordStr";
import { CurrentWordLayout } from "./CurrentWordLayout";
import { WordDefinitionsAI } from "./WordDefinitionsAI";
import { Button } from "@/components/ui/button";
import { Tables } from "@/database.types";
import { areWordsEqual } from "../helpers";
import { useTRPC } from "../trpc/client";

export const CurrentWord: React.FC<{ word: Tables<"word"> } & Attributes> = ({
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
            onSuccess: (wordUpdated) => {
                queryClient.setQueryData(trpc.getWordsAll.queryKey(), (prev) =>
                    prev?.map((wordInner) => {
                        if (!areWordsEqual(wordInner.word, word.word)) {
                            return wordInner;
                        }

                        return wordUpdated;
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

    const timePast = word.ai_definition_request_start_date
        ? Date.now() - new Date(word.ai_definition_request_start_date).valueOf()
        : null;
    const aiRequestAlreadyPending =
        !word.ai_definition &&
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

    return (
        <CurrentWordLayout
            wordStr={word.word}
            addDate={new Date(word.created_at)}
            deleteButtonProps={{
                onClick: () => deleteWord.mutate({ word: word.word }),
                isLoading: deleteWord.isPending,
            }}
            requestAIDefinitionButtonProps={{
                onClick: () =>
                    requestAIDefinition.mutate({ wordStr: word.word }),
                isLoading: requestAIDefinition.isPending,
                disabled: !word.ai_definition,
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
            {word.ai_definition ? (
                <WordDefinitionsAI definitionRaw={word.ai_definition} />
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
