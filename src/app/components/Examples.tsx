import { Word } from './Word';
import { DBWord } from '../types';
import { Fragment } from 'react';

type ExamplesProps = {
    examples: string[];
    wordsAll?: DBWord[];
    textSourceSubmitted: string | null;
    onWordClick: (word: string) => void;
};

export function Examples({
    examples,
    wordsAll,
    textSourceSubmitted,
    onWordClick,
}: ExamplesProps) {
    return (
        <div className="ml-4">
            {examples.map((example, index) => (
                <div key={index} className="text-sm text-gray-400">
                    •{' '}
                    {example.split(' ').map((word, wordIndex, array) => (
                        <Fragment key={`${word}-${wordIndex}`}>
                            <Word
                                word={word}
                                allWords={wordsAll}
                                currentWord={textSourceSubmitted}
                                onClick={onWordClick}
                            />
                            {wordIndex < array.length - 1 ? ' ' : ''}
                        </Fragment>
                    ))}
                </div>
            ))}
        </div>
    );
}
