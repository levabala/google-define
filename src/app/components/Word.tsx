"use client";
import { cn } from "@/lib/utils";
import { areWordsEqual } from "../helpers";
import { useAddWordMutation } from "../hooks/useAddWordMutation";
import { useCurrentWordStr } from "../hooks/useCurrentWordStr";
import { useShouldRequestAIDefinitionQueryState } from "../hooks/useShouldRequestAIDefinitionQueryState";
import { useWordsAllQuery } from "../hooks/useWordsAllQuery";


export const Word: React.FC<
    {
        word: string;
    } & React.HTMLAttributes<HTMLSpanElement>
> = ({ word, className, onClick, ...props }) => {
    const wordsAll = useWordsAllQuery();
    const addWord = useAddWordMutation();
    const { setShouldRequestAIDefinition } = useShouldRequestAIDefinitionQueryState();

    const { currentWordStr, setCurrentWordStr } = useCurrentWordStr();

    const isHighlighted = areWordsEqual(currentWordStr || "", word);
    const isAdded = Boolean(
        wordsAll.data?.find((wordInner) => areWordsEqual(wordInner.word, word))
    );

    return (
        <span
            className={cn(
                "inline hover:underline cursor-pointer",
                addWord.isPending && "animate-pulse duration-800",
                isAdded && !isHighlighted && "font-bold",
                isHighlighted && "underline",
                className
            )}
            onClick={(e) => {
                if (!areWordsEqual(word, currentWordStr || "")) {
                    if (e.metaKey) {
                        if (!isAdded) {
                            addWord.mutate({
                                value: word,
                                shouldFetchAIDefinition: true,
                            });
                        }
                    } else {
                        addWord.mutate(
                            {
                                value: word,
                            },
                            {
                                onSuccess: () => {
                                    setCurrentWordStr(word);
                                    setShouldRequestAIDefinition(true);
                                },
                            }
                        );
                    }
                }

                onClick?.(e);
            }}
            {...props}
        >
            {word}
        </span>
    );
};

