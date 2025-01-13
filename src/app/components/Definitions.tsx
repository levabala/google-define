import { Word } from './Word';
import { Examples } from './Examples';
import { DBWord } from '../types';
import { WordData } from '../types';
import { Fragment } from 'react';

type DefinitionsProps = {
    results: WordData['results'];
    wordsAll?: DBWord[];
    textSourceSubmitted: string | null;
    onWordClick: (word: string) => void;
};

export function Definitions({ results, wordsAll, textSourceSubmitted, onWordClick }: DefinitionsProps) {
    return (
        <div className="flex flex-col gap-2">
            {results.map(result => (
                <div key={result.definition} className="text-white">
                    {result.partOfSpeech && (
                        <span className="font-bold">
                            {result.partOfSpeech}:{' '}
                        </span>
                    )}
                    {result.definition.split(' ').map((word, wordIndex, array) => (
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
                    {result.examples && result.examples.length > 0 && (
                        <Examples
                            examples={result.examples}
                            wordsAll={wordsAll}
                            textSourceSubmitted={textSourceSubmitted}
                            onWordClick={onWordClick}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
