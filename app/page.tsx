'use client';

import React, { useState } from 'react';
import { Word } from './components/Word';
import { ButtonToLearn } from './components/ButtonToLearn';
import { ButtonLearned } from './components/ButtonLearned';
import { ButtonDelete } from './components/ButtonDelete';
import { Definitions } from './components/Definitions';
import { useQueryGetWord } from './hooks/useQueryGetWord';
import { useQueryGetWordsAll } from './hooks/useQueryGetWordsAll';

export default function Main() {
    const [textSourceCurrent, setTextSourceCurrent] = useState<string>('');
    const [textSourceSubmitted, setTextSourceSubmitted] = useState<string>('');

    const { data: wordCurrent } = useQueryGetWord(textSourceSubmitted);
    const { data: wordsAll } = useQueryGetWordsAll();

    return (
        <div className="flex flex-col gap-1">
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
                <button type="submit">Search</button>
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
            </form>

            {wordCurrent && (
                <Definitions
                    results={wordCurrent.results}
                    wordsAll={wordsAll}
                    textSourceSubmitted={textSourceSubmitted}
                    onWordClick={word => {
                        setTextSourceCurrent(word);
                        setTextSourceSubmitted(word);
                    }}
                />
            )}

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

            <textarea
                className="bg-gray-800 text-white border border-gray-500 focus-visible:outline-gray-800"
                rows={100}
                cols={50}
                value={JSON.stringify(wordCurrent, undefined, 2)}
                disabled
            />
        </div>
    );
}
