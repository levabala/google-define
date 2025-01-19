'use client';

import React, { useLayoutEffect, useState } from 'react';
import { randomInteger } from 'remeda';
import { WordsAll } from './components/WordsAll';
import { Definitions } from './components/Definitions';
import { useQueryGetWord, fetchGetWord } from './hooks/useQueryGetWord';
import { queryClient } from './providers';
import { useQueryGetWordsAll } from './hooks/useQueryGetWordsAll';
import { useMutationTrainingGuess } from './hooks/useMutationTrainingGuess';
import { DefinitionsTrain } from './components/DefinitionsTrain';
import { useQueryGetGuessStats } from './hooks/useQueryGetGuessStats';
import { useQueryGetRecentGuesses } from './hooks/useQueryGetRecentGuesses';
import { StatsDisplay } from './components/StatsDisplay';
import { WordControls } from './components/WordControls';
import { WordData } from './types';

export default function Main() {
    const trainingGuessMutation = useMutationTrainingGuess();
    const [textSourceCurrent, setTextSourceCurrent] = useState<string>('');
    const [textSourceSubmitted, setTextSourceSubmitted] = useState<string>('');
    const [isTraining, setIsTraining] = useState(false);
    const [addNextToLearn, setAddNextToLearn] = useState(false);
    const [wordToTrain, setWordToTrain] = useState<WordData | null>(null);
    const [wordToTrainNext, setWordToTrainNext] = useState<string | null>(null);

    const { data: wordCurrent, isFetching: isFetchingWordCurrent } =
        useQueryGetWord(textSourceSubmitted);
    const { data: stats } = useQueryGetGuessStats(textSourceSubmitted);
    const { data: recentGuesses } =
        useQueryGetRecentGuesses(textSourceSubmitted);
    const { data: wordsAll } = useQueryGetWordsAll();

    const onWordClickCommon = (word: string, addToLearn?: boolean) => {
        console.log({ word, addToLearn });
        setAddNextToLearn(addToLearn || false);
        setTextSourceCurrent(word);
        setTextSourceSubmitted(word);
    };

    useLayoutEffect(() => {
        console.log({
            isTraining,
            wordCurrent,
            wordToTrain,
            isFetchingWordCurrent,
        });
        if (isTraining && wordCurrent && !isFetchingWordCurrent && wordsAll) {
            const wordsToLearn = wordsAll.filter(
                word =>
                    word.word !== textSourceCurrent &&
                    word.status === 'TO_LEARN',
            );

            if (wordsToLearn.length === 0) {
                setTextSourceCurrent('');
                setTextSourceSubmitted('');
                setIsTraining(false);
                return;
            }

            const nextWordIndex = randomInteger(0, wordsToLearn.length - 1);

            const nextWord = wordsToLearn[nextWordIndex];

            setWordToTrain(wordCurrent);
            setWordToTrainNext(nextWord.word);

            // No need to prefetch since useQueryGetWord will handle fetching
        }
    }, [
        isFetchingWordCurrent,
        isTraining,
        textSourceCurrent,
        textSourceSubmitted,
        wordCurrent,
        wordToTrain,
        wordsAll,
    ]);

    console.log({ wordToTrain });

    return (
        <div className="flex flex-col gap-1">
            <div className="flex gap-4 items-start">
                <WordsAll
                    words={wordsAll}
                    isLoading={!wordsAll}
                    currentWord={textSourceSubmitted}
                    onWordClick={word => {
                        setTextSourceCurrent(word);
                        setTextSourceSubmitted(word);
                    }}
                />
                <button
                    onClick={async () => {
                        const response = await fetch('/api/logout', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        if (response.ok) {
                            window.location.href = '/login';
                        } else {
                            console.error('Logout failed');
                        }
                    }}
                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            <WordControls
                textSourceCurrent={textSourceCurrent}
                setTextSourceCurrent={setTextSourceCurrent}
                textSourceSubmitted={textSourceSubmitted}
                setTextSourceSubmitted={setTextSourceSubmitted}
                isTraining={isTraining}
                setIsTraining={setIsTraining}
                wordsAll={wordsAll}
            />

            <StatsDisplay
                stats={stats}
                word={textSourceSubmitted}
                isLoading={!!textSourceSubmitted && !stats}
                recentGuesses={recentGuesses}
            />

            {isTraining && wordToTrain && wordsAll ? (
                <DefinitionsTrain
                    results={wordToTrain.results}
                    wordsAll={wordsAll}
                    word={wordToTrain.word}
                    onWordClick={(word, addToLearn) => {
                        onWordClickCommon(word, addToLearn);
                        setIsTraining(false);
                    }}
                    onSuccess={definition => {
                        if (!textSourceSubmitted) return;
                        trainingGuessMutation.mutate({
                            word: textSourceSubmitted,
                            success: true,
                            definition,
                        });
                    }}
                    onFailure={definition => {
                        if (!textSourceSubmitted) return;
                        trainingGuessMutation.mutate({
                            word: textSourceSubmitted,
                            success: false,
                            definition,
                        });
                    }}
                    onNext={() => {
                        if (!wordToTrainNext) {
                            setIsTraining(false);
                            return;
                        }

                        setTextSourceCurrent(wordToTrainNext);
                        setTextSourceSubmitted(wordToTrainNext);
                    }}
                />
            ) : wordCurrent ? (
                <Definitions
                    results={wordCurrent.results}
                    wordsAll={wordsAll}
                    textSourceSubmitted={textSourceSubmitted}
                    onWordClick={onWordClickCommon}
                />
            ) : null}
        </div>
    );
}
