'use client';

import React, { useEffect, useState } from 'react';
import { randomInteger } from 'remeda';
import { WordsAll } from './components/WordsAll';
import { Definitions } from './components/Definitions';
import { useQueryGetWord } from './hooks/useQueryGetWord';
import { useQueryGetWordsAll } from './hooks/useQueryGetWordsAll';
import { useMutationTrainingGuess } from './hooks/useMutationTrainingGuess';
import { DefinitionsTrain } from './components/DefinitionsTrain';
import { useQueryGetGuessStats } from './hooks/useQueryGetGuessStats';
import { useQueryGetRecentGuesses } from './hooks/useQueryGetRecentGuesses';
import { StatsDisplay } from './components/StatsDisplay';
import { WordControls } from './components/WordControls';

export default function Main() {
    const trainingGuessMutation = useMutationTrainingGuess();
    const [textSourceCurrent, setTextSourceCurrent] = useState<string>('');
    const [textSourceSubmitted, setTextSourceSubmitted] = useState<string>('');
    const [isTraining, setIsTraining] = useState(false);
    const [addNextToLearn, setAddNextToLearn] = useState(false);

    const { data: wordCurrent } = useQueryGetWord(
        textSourceSubmitted,
        addNextToLearn ? 'TO_LEARN' : undefined,
    );
    const { data: stats } = useQueryGetGuessStats(textSourceSubmitted);
    const { data: recentGuesses } =
        useQueryGetRecentGuesses(textSourceSubmitted);
    const { data: wordsAll } = useQueryGetWordsAll();

    useEffect(() => {
        console.log(wordsAll);
    }, [wordsAll]);

    const onWordClickCommon = (word: string, addToLearn?: boolean) => {
        console.log({ word, addToLearn });
        setAddNextToLearn(addToLearn || false);
        setTextSourceCurrent(word);
        setTextSourceSubmitted(word);
    };

    return (
        <div className="flex flex-col gap-1">
            <WordsAll
                words={wordsAll}
                isLoading={!wordsAll}
                currentWord={textSourceSubmitted}
                onWordClick={word => {
                    setTextSourceCurrent(word);
                    setTextSourceSubmitted(word);
                }}
            />

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

            {wordCurrent &&
                (isTraining && wordsAll ? (
                    <DefinitionsTrain
                        results={wordCurrent.results}
                        wordsAll={wordsAll}
                        textSourceSubmitted={textSourceSubmitted}
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

                            const nextWordIndex = randomInteger(
                                0,
                                wordsToLearn.length - 1,
                            );

                            const nextWord = wordsToLearn[nextWordIndex];
                            setTextSourceCurrent(nextWord.word);
                            setTextSourceSubmitted(nextWord.word);
                        }}
                    />
                ) : (
                    <Definitions
                        results={wordCurrent.results}
                        wordsAll={wordsAll}
                        textSourceSubmitted={textSourceSubmitted}
                        onWordClick={onWordClickCommon}
                    />
                ))}
        </div>
    );
}
