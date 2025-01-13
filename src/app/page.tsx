'use client';

import React, { useEffect, useState } from 'react';
import { randomInteger } from 'remeda';
import { Word } from './components/Word';
import { ButtonToLearn } from './components/ButtonToLearn';
import { ButtonLearned } from './components/ButtonLearned';
import { ButtonDelete } from './components/ButtonDelete';
import { Definitions } from './components/Definitions';
import { useQueryGetWord } from './hooks/useQueryGetWord';
import { useQueryGetWordsAll } from './hooks/useQueryGetWordsAll';
import { useMutationTrainingGuess } from './hooks/useMutationTrainingGuess';
import { DefinitionsTrain } from './components/DefinitionsTrain';

export default function Main() {
    const trainingGuessMutation = useMutationTrainingGuess();
    const [textSourceCurrent, setTextSourceCurrent] = useState<string>('');
    const [textSourceSubmitted, setTextSourceSubmitted] = useState<string>('');
    const [isTraining, setIsTraining] = useState(false);
    const [addNextToLearn, setAddNextToLearn] = useState(false);

    console.log({ addNextToLearn });
    const { data: wordCurrent } = useQueryGetWord(
        textSourceSubmitted,
        addNextToLearn ? 'TO_LEARN' : undefined,
    );
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
            <h2 className="text-white">my words:</h2>
            {wordsAll && (
                <div className="flex flex-wrap gap-2 text-white">
                    {wordsAll
                        .filter(word => word.status !== 'HIDDEN')
                        .map(wordObj => (
                            <Word
                                key={wordObj.word}
                                word={wordObj.word}
                                allWords={wordsAll}
                                currentWord={textSourceSubmitted}
                                small
                                onClick={word => {
                                    setTextSourceCurrent(word);
                                    setTextSourceSubmitted(word);
                                }}
                            />
                        ))}
                </div>
            )}

            <form
                onSubmit={e => {
                    e.preventDefault();
                    setTextSourceSubmitted(textSourceCurrent);
                }}
            >
                <input
                    type="text"
                    value={textSourceCurrent}
                    onChange={e => setTextSourceCurrent(e.target.value)}
                    className="bg-gray-800 text-white border border-gray-500 focus-visible:outline-gray-800"
                />
                <button type="submit" className="bg-gray-300 p-1 ml-1">
                    Search
                </button>
                <ButtonToLearn
                    textSourceSubmitted={textSourceSubmitted}
                    wordsAll={wordsAll}
                />
                <ButtonLearned
                    textSourceSubmitted={textSourceSubmitted}
                    wordsAll={wordsAll}
                />
                <ButtonDelete
                    textSourceSubmitted={textSourceSubmitted}
                    wordsAll={wordsAll}
                    setTextSourceCurrent={setTextSourceCurrent}
                    setTextSourceSubmitted={setTextSourceSubmitted}
                />
                <label className="ml-1 text-white">
                    <input
                        type="checkbox"
                        onChange={e => setIsTraining(e.target.checked)}
                        checked={isTraining}
                    />
                    Train
                </label>
            </form>

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
