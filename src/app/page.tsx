"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Attributes, Fragment, JSX, useEffect, useMemo } from "react";
import { AI_DEFINITION_EXPIRATION_DURATION_MS } from "./constants";
import { Button, ButtonProps } from "@/components/ui/button";
import { Toggle, ToggleProps } from "@/components/ui/toggle";
import { Definition, DefinitionSchema } from "./types";
import { formatDateRelativeAuto } from "./utils";
import { Json, Tables } from "@/database.types";
import { Input } from "@/components/ui/input";
import { sortWordsAll } from "./helpers";
import { useTRPC } from "./trpc/client";
import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import { type } from "arktype";

function useShouldRequestAIDefinitionQueryState() {
    const [shouldRequestAIDefinition, setShouldRequestAIDefinition] =
        useQueryState("should-request-ai-definition");

    return {
        shouldRequestAIDefinition: shouldRequestAIDefinition === "1",
        setShouldRequestAIDefinition: (value: boolean) =>
            setShouldRequestAIDefinition(value ? "1" : null),
    };
}

function useAddWordMutation() {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const mutateOptions = trpc.addWord.mutationOptions({
        onSuccess: (res) => {
            queryClient.setQueryData(trpc.getWordsAll.queryKey(), (prev) => [
                res,
                ...(prev || []),
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

    const query = useQuery(trpc.getWordsAll.queryOptions());

    return useMemo(() => {
        return {
            ...query,
            data: query.data ? sortWordsAll(query.data) : query.data,
        };
    }, [query]);
}

function isAlphanumericCharCodeOrDash(charCode: number): boolean {
    return (
        (charCode >= 48 && charCode <= 57) || // Numbers 0-9
        (charCode >= 65 && charCode <= 90) || // Uppercase letters A-Z
        (charCode >= 97 && charCode <= 122) ||
        charCode === 45 // Dash -
    ); // Lowercase letters a-z
}

function removeNonAlphanumeric(str: string): string {
    let result = "";
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const charCode = str.charCodeAt(i);

        if (
            isAlphanumericCharCodeOrDash(charCode) ||
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
            const isAlphaNum = isAlphanumericCharCodeOrDash(charCode);

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
    const { setShouldRequestAIDefinition } =
        useShouldRequestAIDefinitionQueryState();

    const { currentWordStr, setCurrentWordStr } = useCurrentWordStr();

    const isHighlighted = areWordsEqual(currentWordStr || "", word);
    const isAdded = Boolean(
        wordsAll.data?.find((wordInner) => areWordsEqual(wordInner.word, word)),
    );

    return (
        <span
            className={cn(
                "inline hover:underline cursor-pointer",
                addWord.isPending && "animate-pulse duration-800",
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
                        addWord.mutate(
                            {
                                value: word,
                            },
                            {
                                onSuccess: () => {
                                    setCurrentWordStr(word);
                                    setShouldRequestAIDefinition(true);
                                },
                            },
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

const WordButton: React.FC<
    {
        word: string;
    } & React.ComponentProps<typeof Button>
> = ({ word, className, onClick, ...props }) => {
    const wordsAll = useWordsAllQuery();
    const { currentWordStr, setCurrentWordStr } = useCurrentWordStr();

    const wordData = wordsAll.data?.find((wordInner) =>
        areWordsEqual(wordInner.word, word),
    );
    const isHighlighted = areWordsEqual(currentWordStr || "", word);
    const isLearned = wordData?.status === "LEARNED";
    const hasNoAIDefinition = !wordData?.ai_definition;

    return (
        <Button
            variant="link"
            className={cn(
                "flex max-w-full text-primary-foreground",
                isLearned && "text-success decoration-success",
                isHighlighted && "font-bold",
                className,
            )}
            onClick={(e) => {
                setCurrentWordStr(word);
                onClick?.(e);
            }}
            {...props}
        >
            <span
                className={cn(
                    "block w-full overflow-hidden text-ellipsis whitespace-nowrap",
                    hasNoAIDefinition && "text-muted-foreground",
                    isLearned && "text-success decoration-success",
                )}
            >
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
        <div className="flex flex-col gap-2 grow">
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
        addDate?: Date;
        deleteButtonProps: ButtonProps;
        wordUpdateIfLearnedProps: ToggleProps;
    } & React.PropsWithChildren
> = ({
    children,
    addDate,
    wordStr,
    deleteButtonProps,
    wordUpdateIfLearnedProps,
}) => {
    return (
        <div className="flex grow flex-col gap-1 overflow-hidden">
            <div className="flex items-center gap-2 justify-between">
                <span>
                    <h3 className="text-xl inline">{wordStr}</h3>
                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                        {addDate && formatDateRelativeAuto(addDate)}
                    </span>
                </span>
            </div>
            <div className="flex flex-col grow overflow-auto">{children}</div>
            <div className="flex gap-1 self-end">
                <Toggle
                    variant="outline"
                    size="sm"
                    className="data-[state=on]:bg-success"
                    {...wordUpdateIfLearnedProps}
                >
                    Learned
                </Toggle>
                <Button variant="destructive" size="sm" {...deleteButtonProps}>
                    Delete
                </Button>
            </div>
        </div>
    );
};

const CurrentWord: React.FC<{ word: Tables<"word"> } & Attributes> = ({
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

    useEffect(() => {
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

export default function Main() {
    const { setShouldRequestAIDefinition } =
        useShouldRequestAIDefinitionQueryState();
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
                        wordStr={currentWordStr || "what to save next?"}
                        deleteButtonProps={{ disabled: true }}
                        wordUpdateIfLearnedProps={{ disabled: true }}
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

                    const value = (formData.get("value")?.valueOf() as string)
                        .trim()
                        .toLowerCase();

                    setCurrentWordStr(value);

                    if (
                        wordsAll.data?.find((word) =>
                            areWordsEqual(word.word, value),
                        )
                    ) {
                        form.reset();
                        return;
                    }

                    addWord.mutate(
                        { value },
                        {
                            onSuccess: () => {
                                form.reset();
                                setShouldRequestAIDefinition(true);
                            },
                        },
                    );
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
