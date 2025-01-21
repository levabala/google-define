'use client';

import dynamic from 'next/dynamic';
import React, { useLayoutEffect, useState } from 'react';
import { useQueryState } from 'nuqs';
import { randomInteger } from 'remeda';
import { WordsAll } from './components/WordsAll';
import { Definitions } from './components/Definitions';
import { useWord } from './hooks/useWord';
import { useMutationAddWord } from './hooks/useMutationAddWord';
import { useQueryGetWordsAll } from './hooks/useQueryGetWordsAll';
import { useMutationTrainingGuess } from './hooks/useMutationTrainingGuess';
import { DefinitionsTrain } from './components/DefinitionsTrain';
import { useQueryGetGuessStats } from './hooks/useQueryGetGuessStats';
import { useQueryGetRecentGuesses } from './hooks/useQueryGetRecentGuesses';
import { StatsDisplay } from './components/StatsDisplay';
import { WordControls } from './components/WordControls';
import { WordData, DBWord, WordStats } from './types';
import { Spinner } from './components/Spinner';
import { toast } from 'react-toastify';

function Main() {
    const trainingGuessMutation = useMutationTrainingGuess();
    const [textSourceCurrent, setTextSourceCurrent] = useState('');
    const [textSourceSubmitted, setTextSourceSubmitted] = useQueryState('word', {
        defaultValue: '',
        clearOnDefault: true,
    });
    const [hasMissingWordError, setHasMissingWordError] = useState(false);
    const [isTraining, setIsTraining] = useState(false);
    const [addNextToLearn, setAddNextToLearn] = useState(false);
    const [wordToTrain, setWordToTrain] = useState<WordData | null>(null);
    const [wordToTrainNext, setWordToTrainNext] = useState<string | null>(null);

    const addWordMutation = useMutationAddWord();
    const wordCurrent = useWord(textSourceSubmitted);
    const isFetchingWordCurrent = !wordCurrent && !!textSourceSubmitted;

    useLayoutEffect(() => {
        if (textSourceSubmitted && !wordCurrent && !isFetchingWordCurrent) {
            setHasMissingWordError(true);
            toast.error(`Word "${textSourceSubmitted}" not found`);
        } else {
            setHasMissingWordError(false);
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
        setIsTraining,
        setWordToTrain,
        setWordToTrainNext,
    ]);

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
                textSourceCurrent={hasMissingWordError ? textSourceSubmitted : textSourceCurrent}
                setTextSourceCurrent={setTextSourceCurrent}
                textSourceSubmitted={textSourceSubmitted}
                setTextSourceSubmitted={async (text) => {
                    try {
                        await setTextSourceSubmitted(text);
                        if (text && !wordsAll?.some((w: DBWord) => w.word === text)) {
                            await addWordMutation.mutateAsync({
                                word: text,
                                initialStatus: addNextToLearn ? 'TO_LEARN' : undefined
                            });
                        }
                    } catch {
                        // Reset the submitted text on error
                        await setTextSourceSubmitted('');
                        setTextSourceCurrent('');
                    }
                }}
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

            {isFetchingWordCurrent ? (
                <Spinner />
            ) : isTraining && wordToTrain && wordsAll ? (
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
                            definition: definition,
                        });
                    }}
                    onFailure={definition => {
                        if (!textSourceSubmitted) return;
                        trainingGuessMutation.mutate({
                            word: textSourceSubmitted,
                            success: false,
                            definition: definition,
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
                    results={wordCurrent.raw.results}
                    textSourceSubmitted={textSourceSubmitted}
                    onWordClick={onWordClickCommon}
                    aiDefinition={wordCurrent.ai_definition || undefined}
                    wordsAll={wordsAll}
                />
            ) : null}
        </div>
    );
}

export default dynamic(() => Promise.resolve(Main), { 
    ssr: false 
});
