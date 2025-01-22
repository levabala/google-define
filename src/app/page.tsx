"use client";

import dynamic from "next/dynamic";
import React, { useLayoutEffect, useState } from "react";
import { useQueryState } from "nuqs";
import { randomInteger } from "remeda";
import { WordsAll } from "./components/WordsAll";
import { useWord } from "./hooks/useWord";
import { useMutationAddWord } from "./hooks/useMutationAddWord";
import { useQueryGetWordsAll } from "./hooks/useQueryGetWordsAll";
import { useQueryGetGuessStats } from "./hooks/useQueryGetGuessStats";
import { useQueryGetRecentGuesses } from "./hooks/useQueryGetRecentGuesses";
import { StatsDisplay } from "./components/StatsDisplay";
import { WordControls } from "./components/WordControls";
import { DBWord, WordStats } from "./types";
import { toast } from "react-toastify";
import { useMount } from "react-use";
import { TrainingModeToggle } from "./components/TrainingModeToggle";
import { MainBody } from "./components/MainBody";

function Main() {
    const [textSourceCurrent, setTextSourceCurrent] = useState("");
    const [textSourceSubmitted, setTextSourceSubmitted] = useQueryState(
        "word",
        {
            defaultValue: "",
            clearOnDefault: true,
        },
    );
    const [mode, setMode] = useState<'explore' | 'definition' | 'spelling'>('explore');
    const isTraining = mode !== 'explore';
    const trainingMode = mode === 'explore' ? 'definition' : mode;
    const [addNextToLearn, setAddNextToLearn] = useState(false);
    const [wordToTrain, setWordToTrain] = useState<DBWord | null>(null);
    const [wordToTrainNext, setWordToTrainNext] = useState<string | null>(null);

    const addWordMutation = useMutationAddWord();
    const wordCurrent = useWord(textSourceSubmitted);
    const isFetchingWordCurrent = !wordCurrent && !!textSourceSubmitted;

    useMount(() => {
        if (textSourceSubmitted) {
            setTextSourceCurrent(textSourceSubmitted);
        }
    });

    useLayoutEffect(() => {
        if (textSourceSubmitted && !wordCurrent && !isFetchingWordCurrent) {
            setTextSourceCurrent(textSourceSubmitted);
            toast.error(`Word "${textSourceSubmitted}" not found`);
        }
    }, [textSourceSubmitted, wordCurrent, isFetchingWordCurrent]);

    const { data: stats } = useQueryGetGuessStats(textSourceSubmitted) as {
        data: WordStats | undefined;
    };
    const { data: recentGuesses } =
        useQueryGetRecentGuesses(textSourceSubmitted);
    const { data: wordsAll } = useQueryGetWordsAll();

    const onWordClickCommon = (word: string, addToLearn?: boolean) => {
        setAddNextToLearn(addToLearn || false);
        setTextSourceCurrent(word);
        setTextSourceSubmitted(word);
    };

    useLayoutEffect(() => {
        if (isTraining && wordCurrent && !isFetchingWordCurrent && wordsAll) {
            const wordsToLearn = wordsAll.filter(
                (word: DBWord) =>
                    word.word !== textSourceCurrent &&
                    word.status === "TO_LEARN",
            );

            if (wordsToLearn.length === 0) {
                setTextSourceCurrent("");
                setTextSourceSubmitted("");
                setMode('explore');
                return;
            }

            const nextWordIndex = randomInteger(0, wordsToLearn.length - 1);

            const nextWord = wordsToLearn[nextWordIndex];

            setWordToTrain(wordCurrent);
            setWordToTrainNext(nextWord.word);
        }
    }, [
        isFetchingWordCurrent,
        isTraining,
        textSourceCurrent,
        textSourceSubmitted,
        wordCurrent,
        wordToTrain,
        wordsAll,
        setTextSourceCurrent,
        setTextSourceSubmitted,
        setWordToTrain,
        setWordToTrainNext,
    ]);

    return (
        <div className="flex flex-col gap-1">
            <div className="flex gap-4 items-start">
                <WordsAll
                    mode={mode}
                    words={wordsAll}
                    isLoading={!wordsAll}
                    currentWord={textSourceSubmitted}
                    onWordClick={(word) => {
                        setTextSourceCurrent(word);
                        setTextSourceSubmitted(word);
                    }}
                />
                <button
                    onClick={async () => {
                        const response = await fetch("/api/logout", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        });
                        if (response.ok) {
                            window.location.href = "/login";
                        } else {
                            console.error("Logout failed");
                        }
                    }}
                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            <TrainingModeToggle
                mode={mode}
                setMode={setMode}
            />

            <WordControls
                mode={mode}
                textSourceCurrent={textSourceCurrent}
                setTextSourceCurrent={setTextSourceCurrent}
                textSourceSubmitted={textSourceSubmitted}
                setTextSourceSubmitted={async (text) => {
                    try {
                        await setTextSourceSubmitted(text);
                        if (
                            text &&
                            !wordsAll?.some((w: DBWord) => w.word === text)
                        ) {
                            await addWordMutation.mutateAsync({
                                word: text,
                                initialStatus: addNextToLearn
                                    ? "TO_LEARN"
                                    : undefined,
                            });
                        }
                    } catch {
                        // Reset the submitted text on error
                        await setTextSourceSubmitted("");
                        setTextSourceCurrent("");
                    }
                }}
                wordsAll={wordsAll}
            />

            <StatsDisplay
                stats={stats}
                word={textSourceSubmitted}
                isLoading={!!textSourceSubmitted && !stats}
                recentGuesses={recentGuesses}
            />

            {wordCurrent && wordsAll && (
                <MainBody
                    isFetchingWordCurrent={isFetchingWordCurrent}
                    isTraining={isTraining}
                    setMode={setMode}
                    wordCurrent={wordCurrent}
                    wordToTrain={wordToTrain}
                    wordsAll={wordsAll}
                    textSourceSubmitted={textSourceSubmitted}
                    setTextSourceCurrent={setTextSourceCurrent}
                    setTextSourceSubmitted={setTextSourceSubmitted}
                    trainingMode={trainingMode}
                    onWordClickCommon={onWordClickCommon}
                    wordToTrainNext={wordToTrainNext}
                />
            )}
        </div>
    );
}

export { Main };
export default dynamic(() => Promise.resolve(Main), {
    ssr: false,
});
