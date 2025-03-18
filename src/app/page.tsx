"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Attributes, Fragment, JSX, useEffect, useMemo } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Definition, DefinitionSchema } from "./types";
import { Json, Tables } from "@/database.types";
import { Input } from "@/components/ui/input";
import { useTRPC } from "./trpc/client";
import { useQueryState } from "nuqs";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { type } from "arktype";

function useAddWordMutation() {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const mutateOptions = trpc.addWord.mutationOptions({
        onSuccess: (res) => {
            queryClient.setQueryData(trpc.getWordsAll.queryKey(), (prev) => [
                ...(prev || []),
                res,
            ]);
        },
    });

    const mutateOptionsPatched: typeof mutateOptions = {
        ...mutateOptions,
        mutationFn: mutateOptions.mutationFn
            ? ({ value, ...rest }) =>
                  mutateOptions.mutationFn!({
                      value: normalizeWord(value),
                      ...rest,
                  })
            : undefined,
    };

    return useMutation(mutateOptionsPatched);
}

function useWordsAllQuery() {
    const trpc = useTRPC();

    return useQuery(trpc.getWordsAll.queryOptions());
}

function isAlphanumericCharCode(charCode: number): boolean {
    return (
        (charCode >= 48 && charCode <= 57) || // Numbers 0-9
        (charCode >= 65 && charCode <= 90) || // Uppercase letters A-Z
        (charCode >= 97 && charCode <= 122)
    ); // Lowercase letters a-z
}

function removeNonAlphanumeric(str: string): string {
    let result = "";
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const charCode = str.charCodeAt(i);

        if (
            isAlphanumericCharCode(charCode) ||
            charCode === 32 // Space character
        ) {
            result += char;
        }
    }
    return result;
}

function normalizeWord(str: string): string {
    return removeNonAlphanumeric(str).trim().toLowerCase();
}

function areWordsEqual(w1: string, w2: string) {
    return normalizeWord(w1) === normalizeWord(w2);
}

function useCurrentWordStr() {
    const [currentWordStr, setCurrentWordStr] = useQueryState("word", {
        history: "push",
    });

    return { currentWordStr, setCurrentWordStr };
}

const TextAsWords: React.FC<{
    text: string;
}> = ({ text }) => {
    const parts = useMemo(() => {
        const parts: JSX.Element[] = [];
        let currentWord = "";
        let currentNonWord = "";

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charCode = text.charCodeAt(i);

            // Check if character is alphanumeric
            const isAlphaNum = isAlphanumericCharCode(charCode);

            if (isAlphaNum) {
                // If we were building a non-word, flush it
                if (currentNonWord) {
                    parts.push(
                        <Fragment key={parts.length}>
                            {currentNonWord}
                        </Fragment>,
                    );
                    currentNonWord = "";
                }
                currentWord += char;
            } else {
                // If we were building a word, flush it
                if (currentWord) {
                    parts.push(<Word key={parts.length} word={currentWord} />);
                    currentWord = "";
                }
                currentNonWord += char;
            }
        }

        // Flush any remaining content
        if (currentWord) {
            parts.push(<Word key={parts.length} word={currentWord} />);
        }
        if (currentNonWord) {
            parts.push(
                <Fragment key={parts.length}>{currentNonWord}</Fragment>,
            );
        }

        return parts;
    }, [text]);

    return <>{parts}</>;
};

const Word: React.FC<
    {
        word: string;
    } & React.HTMLAttributes<HTMLSpanElement>
> = ({ word, className, onClick, ...props }) => {
    const wordsAll = useWordsAllQuery();
    const addWord = useAddWordMutation();

    const { currentWordStr, setCurrentWordStr } = useCurrentWordStr();

    const isHighlighted = areWordsEqual(currentWordStr || "", word);
    const isAdded = Boolean(
        wordsAll.data?.find((wordInner) => areWordsEqual(wordInner.word, word)),
    );

    return (
        <span
            className={cn(
                "inline hover:underline cursor-pointer",
                addWord.isPending && "animate-pulse duration-500",
                isAdded && !isHighlighted && "font-bold",
                isHighlighted && "underline",
                className,
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
                        setCurrentWordStr(word);
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

const WordButton: React.FC<
    {
        word: string;
    } & React.ComponentProps<typeof Button>
> = ({ word, className, onClick, ...props }) => {
    const { currentWordStr, setCurrentWordStr } = useCurrentWordStr();

    const isHighlighted = areWordsEqual(currentWordStr || "", word);

    return (
        <Button
            variant="link"
            className={cn(
                "flex max-w-full",
                isHighlighted && "text-primary-foreground",
                className,
            )}
            onClick={(e) => {
                setCurrentWordStr(word);
                onClick?.(e);
            }}
            {...props}
        >
            <span className="block w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {word}
            </span>
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
        <div className="flex flex-col gap-2 overflow-auto">
            {definitionList.map((definition) => (
                <WordDefinition
                    key={definition.definition + definition.partOfSpeech}
                    definition={definition}
                />
            ))}
        </div>
    );
};

const CurrentWordLayout: React.FC<
    {
        wordStr: string;
        deleteButtonProps: ButtonProps;
    } & React.PropsWithChildren
> = ({ children, wordStr, deleteButtonProps }) => {
    return (
        <div className="flex grow flex-col gap-1 overflow-hidden">
            <div className="flex items-center gap-2 justify-between">
                <h3 className="text-xl">{wordStr}</h3>
                <Button variant="destructive" size="sm" {...deleteButtonProps}>
                    Delete
                </Button>
            </div>
            {children}
        </div>
    );
};

const CurrentWord: React.FC<{ word: Tables<"word"> } & Attributes> = ({
    word,
}) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { setCurrentWordStr } = useCurrentWordStr();

    const requestAIDefinition = useMutation(
        trpc.requestAIDefinition.mutationOptions({
            onSuccess: (res) => {
                queryClient.setQueryData(trpc.getWordsAll.queryKey(), (prev) =>
                    prev?.map((wordInner) => {
                        if (!areWordsEqual(wordInner.word, word.word)) {
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
                setCurrentWordStr(null);
            },
        }),
    );

    const aiRequestAlreadyPending =
        !word.ai_definition && word.ai_definition_request_start_date !== null;

    return (
        <CurrentWordLayout
            wordStr={word.word}
            deleteButtonProps={{
                onClick: () => deleteWord.mutate({ word: word.word }),
                isLoading: deleteWord.isPending,
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
                        isLoading={
                            requestAIDefinition.isPending ||
                            aiRequestAlreadyPending
                        }
                    >
                        ai definition
                        {aiRequestAlreadyPending ? "(refresh to check)" : null}
                    </Button>
                </div>
            )}
        </CurrentWordLayout>
    );
};

function Main() {
    const [shouldInvalidate, setShouldInvalidate] = useQueryState("invalidate");
    const { currentWordStr, setCurrentWordStr } = useCurrentWordStr();

    const addWord = useAddWordMutation();
    const wordsAll = useWordsAllQuery();

    const currentWord: Tables<"word"> | null =
        wordsAll.data?.find((word) => word.word === currentWordStr) || null;

    useEffect(() => {
        if (
            !currentWordStr ||
            currentWord?.word === currentWordStr ||
            addWord.variables?.value === currentWordStr ||
            !wordsAll.data
        ) {
            return;
        }

        addWord.mutate({ value: currentWordStr });
    }, [addWord, currentWord?.word, currentWordStr, wordsAll.data]);

    useEffect(() => {
        if (shouldInvalidate) {
            wordsAll.refetch();
            setShouldInvalidate(null);
        }
    }, [setShouldInvalidate, shouldInvalidate, wordsAll]);

    return (
        <main className="bg-background flex h-screen flex-col gap-2 p-2 max-w-[500px] mx-auto">
            <div className="flex flex-col grow overflow-hidden">
                {currentWord ? (
                    <CurrentWord key={currentWord.word} word={currentWord} />
                ) : (
                    <CurrentWordLayout
                        wordStr={currentWordStr || "no word is chosen"}
                        deleteButtonProps={{ disabled: true }}
                    >
                        {currentWordStr ? (
                            <div className="flex justify-center items-center grow">
                                <Button
                                    type="submit"
                                    className=""
                                    isLoading={addWord.isPending}
                                    onClick={() => {
                                        if (!currentWordStr) {
                                            return;
                                        }

                                        addWord.mutate(
                                            { value: currentWordStr },
                                            {
                                                onSuccess: () => {
                                                    (
                                                        document.getElementById(
                                                            "addWordForm",
                                                        ) as HTMLFormElement
                                                    ).reset();
                                                },
                                            },
                                        );
                                    }}
                                >
                                    look up
                                </Button>
                            </div>
                        ) : null}
                    </CurrentWordLayout>
                )}
            </div>
            <hr className="border-t border-gray-500" />
            <div className="flex flex-wrap shrink-0 h-40 overflow-auto">
                {wordsAll.data
                    ? wordsAll.data.map((word, i) => {
                          return (
                              <div key={word.word + i} className="w-1/2">
                                  <WordButton word={word.word} />
                              </div>
                          );
                      })
                    : "none"}
            </div>
            <form
                id="addWordForm"
                className="flex gap-2"
                onSubmit={(e) => {
                    e.preventDefault();

                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);

                    const data = {
                        value: (formData.get("value")?.valueOf() as string)
                            .trim()
                            .toLowerCase(),
                    };

                    setCurrentWordStr(data.value);

                    if (
                        wordsAll.data?.find((word) =>
                            areWordsEqual(word.word, data.value),
                        )
                    ) {
                        form.reset();
                        return;
                    }

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
