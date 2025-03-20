"use client";

import { useShouldRequestAIDefinitionQueryState } from "../hooks/useShouldRequestAIDefinitionQueryState";
import { CurrentWordLayout } from "../components/CurrentWordLayout";
import { useAddWordMutation } from "../hooks/useAddWordMutation";
import { useCurrentWordStr } from "../hooks/useCurrentWordStr";
import { useWordsAllQuery } from "../hooks/useWordsAllQuery";
import { CurrentWord } from "../components/CurrentWord";
import { WordButton } from "../components/WordButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { areWordsEqual } from "../helpers";
import { useLayoutEffect } from "react";
import { useQueryState } from "nuqs";
import { Word } from "../types";

export default function Main() {
    console.log('------- vocabulary page', typeof window);

    const { setShouldRequestAIDefinition } =
        useShouldRequestAIDefinitionQueryState();
    const [shouldInvalidate, setShouldInvalidate] = useQueryState("invalidate");
    const { currentWordStr, setCurrentWordStr } = useCurrentWordStr();

    const addWord = useAddWordMutation();
    const wordsAll = useWordsAllQuery();

    const currentWord: Word | null =
        wordsAll.data?.find((word) => word.word === currentWordStr) || null;

    useLayoutEffect(() => {
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

    useLayoutEffect(() => {
        if (shouldInvalidate) {
            wordsAll.refetch();
            setShouldInvalidate(null);
        }
    }, [setShouldInvalidate, shouldInvalidate, wordsAll]);

    return (
        <>
            <div className="flex flex-col grow overflow-hidden">
                {currentWord ? (
                    <CurrentWord key={currentWord.word} word={currentWord} />
                ) : (
                    <CurrentWordLayout
                        wordStr={currentWordStr || "what to save next?"}
                        deleteButtonProps={{ disabled: true }}
                        requestAIDefinitionButtonProps={{ disabled: true }}
                        wordUpdateIfLearnedProps={{ disabled: true }}
                    />
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
        </>
    );
}
