"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Definition, DefinitionSchema } from "./types";
import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Json, Tables } from "@/database.types";
import { Input } from "@/components/ui/input";
import { useTRPC } from "./trpc/client";
import { useQueryState } from "nuqs";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { type } from "arktype";

function removeNonAlphanumeric(str: string): string {
    let result = "";
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const charCode = str.charCodeAt(i);

        if (
            (charCode >= 48 && charCode <= 57) || // Numbers 0-9
            (charCode >= 65 && charCode <= 90) || // Uppercase letters A-Z
            (charCode >= 97 && charCode <= 122) // Lowercase letters a-z
        ) {
            result += char;
        }
    }
    return result;
}

function useCurrentWordStr() {
    const [currentWordStr, setCurrentWordStr] = useQueryState("word");

    return { currentWordStr, setCurrentWordStr };
}

const TextAsWords: React.FC<{
    text: string;
}> = ({ text }) => {
    const words = text.split(" ");

    return (
        <>
            {words.map((word, i, arr) =>
                i === arr.length - 1 ? (
                    <Word key={word + i} word={word} />
                ) : (
                    <Fragment key={word + i}>
                        <Word word={word} />{" "}
                    </Fragment>
                ),
            )}
        </>
    );
};

const Word: React.FC<
    {
        word: string;
    } & React.HTMLAttributes<HTMLSpanElement>
> = ({ word, className, onClick, ...props }) => {
    const { currentWordStr, setCurrentWordStr } = useCurrentWordStr();

    const isHighlighted = currentWordStr === removeNonAlphanumeric(word);

    return (
        <span
            className={cn(
                "inline hover:underline",
                isHighlighted && "font-bold",
                className,
            )}
            onClick={(e) => {
                setCurrentWordStr(word);
                onClick?.(e);
            }}
            {...props}
        >
            {word}
        </span>
    );
};

const WordButton: React.FC<
    {
        word: string;
    } & React.ComponentProps<typeof Button>
> = ({ word, className, onClick, ...props }) => {
    const { currentWordStr, setCurrentWordStr } = useCurrentWordStr();

    const isHighlighted = currentWordStr === word;

    return (
        <Button
            variant="link"
            className={cn(
                "flex",
                isHighlighted && "text-primary-foreground",
                className,
            )}
            onClick={(e) => {
                setCurrentWordStr(word);
                onClick?.(e);
            }}
            {...props}
        >
            {word}
        </Button>
    );
};

const WordDefinition: React.FC<{ definition: Definition }> = ({
    definition: { definition, partOfSpeech, examples },
}) => {
    return (
        <div className="flex flex-col">
            <div>
                <span className="text-xs">({partOfSpeech}): </span>
                <span>
                    <TextAsWords text={definition} />
                </span>
            </div>
            <ul className="list-disc pl-5">
                {examples.map((example, i) => (
                    <li key={example + i} className="text-sm">
                        <TextAsWords text={example} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const WordDefinitionsAI: React.FC<{ definitionRaw: Json }> = ({
    definitionRaw,
}) => {
    const definitionList = DefinitionSchema.array()(definitionRaw);

    if (definitionList instanceof type.errors) {
        return <div className="text-muted">invalid definition</div>;
    }

    return (
        <div className="flex flex-col gap-2">
            {definitionList.map((definition) => (
                <WordDefinition
                    key={definition.definition + definition.partOfSpeech}
                    definition={definition}
                />
            ))}
        </div>
    );
};

const CurrentWord: React.FC<{ word: Tables<"word"> }> = ({ word }) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const requestAIDefinition = useMutation(
        trpc.requestAIDefinition.mutationOptions({
            onSuccess: (res) => {
                queryClient.setQueryData(trpc.getWordsAll.queryKey(), (prev) =>
                    prev?.map((wordInner) => {
                        if (wordInner.word !== word.word) {
                            return wordInner;
                        }

                        return {
                            ...wordInner,
                            ai_definition: res,
                        };
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
            },
        }),
    );

    return (
        <div className="flex grow flex-col gap-1">
            <div className="flex items-center gap-2 justify-between">
                <h3 className="text-xl">{word.word}</h3>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteWord.mutate({ word: word.word })}
                    isLoading={deleteWord.isPending}
                >
                    Delete
                </Button>
            </div>
            {word.ai_definition ? (
                <WordDefinitionsAI definitionRaw={word.ai_definition} />
            ) : (
                <div className="flex justify-center items-center grow">
                    <Button
                        onClick={() =>
                            requestAIDefinition.mutate({ wordStr: word.word })
                        }
                        isLoading={requestAIDefinition.isPending}
                    >
                        ai definition
                    </Button>
                </div>
            )}
        </div>
    );
};

function Main() {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const [shouldInvalidate, setShouldInvalidate] = useQueryState("invalidate");
    const { currentWordStr } = useCurrentWordStr();
    const [currentWord, setCurrentWord] = useState<Tables<"word"> | null>(null);

    const addWord = useMutation(
        trpc.addWord.mutationOptions({
            onSuccess: (res) => {
                queryClient.setQueryData(
                    trpc.getWordsAll.queryKey(),
                    (prev) => [...(prev || []), res],
                );
            },
        }),
    );
    const wordsAll = useQuery(trpc.getWordsAll.queryOptions());

    useEffect(() => {
        if (!wordsAll.data) {
            return;
        }

        setCurrentWord(
            wordsAll.data.find((word) => word.word === currentWordStr) || null,
        );
    }, [currentWordStr, wordsAll.data]);

    useEffect(() => {
        if (shouldInvalidate) {
            wordsAll.refetch();
            setShouldInvalidate(null);
        }
    }, [setShouldInvalidate, shouldInvalidate, wordsAll]);

    return (
        <main className="bg-background flex h-screen flex-col gap-2 p-2">
            <div className="flex flex-col grow overflow-auto">
                {currentWord ? <CurrentWord word={currentWord} /> : null}
            </div>
            <hr className="border-t border-gray-500" />
            <div className="flex flex-wrap max-h-64 overflow-auto">
                {wordsAll.data
                    ? wordsAll.data.map((word, i) => {
                          return (
                              <div key={word.word + i} className="w-1/3">
                                  <WordButton word={word.word} />
                              </div>
                          );
                      })
                    : "none"}
            </div>
            <form
                className="flex gap-2"
                onSubmit={(e) => {
                    e.preventDefault();

                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);

                    const data = {
                        value: formData.get("value")?.valueOf() as string,
                    };

                    addWord.mutate(data, {
                        onSuccess: () => {
                            form.reset();
                        },
                    });
                }}
            >
                <Input name="value" placeholder="word/phrase" className="" />
                <Button
                    type="submit"
                    className=""
                    isLoading={addWord.isPending}
                >
                    look up
                </Button>
            </form>
        </main>
    );
}

export default dynamic(() => Promise.resolve(Main), {
    ssr: false,
});
