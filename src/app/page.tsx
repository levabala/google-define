'use client';

import React, { useLayoutEffect } from 'react';
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

export default function Main() {
    const trainingGuessMutation = useMutationTrainingGuess();
    const [textSourceCurrent, setTextSourceCurrent] = useQueryState('current', {
        defaultValue: '',
        clearOnDefault: true,
    });
    const [textSourceSubmitted, setTextSourceSubmitted] = useQueryState('submitted', {
        defaultValue: '',
        clearOnDefault: true,
    });
    const [isTraining, setIsTraining] = useState(false);
    const [addNextToLearn, setAddNextToLearn] = useState(false);
    const [wordToTrain, setWordToTrain] = useState<WordData | null>(null);
    const [wordToTrainNext, setWordToTrainNext] = useState<string | null>(null);

    const addWordMutation = useMutationAddWord();
    const wordCurrent = useWord(textSourceSubmitted);
    const isFetchingWordCurrent = !wordCurrent && !!textSourceSubmitted;

    console.log(wordCurrent);

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
    ]);

    return (
        <div className="flex flex-col gap-1">
            <div className="flex gap-4 items-start">
                <WordsAll
                    words={wordsAll}
                    isLoading={!wordsAll}
                    currentWord={textSourceSubmitted}
                    onWordClick={word => {
                        setTextSourceCurrent(word).then(() => setTextSourceSubmitted(word));
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
                setTextSourceSubmitted={async (text) => {
                    await setTextSourceSubmitted(text);
                    if (text && !wordsAll?.some((w: DBWord) => w.word === text)) {
                        await addWordMutation.mutateAsync({
                            word: text,
                            initialStatus: addNextToLearn ? 'TO_LEARN' : undefined
                        });
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

                        setTextSourceCurrent(wordToTrainNext).then(() => setTextSourceSubmitted(wordToTrainNext));
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
