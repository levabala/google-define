import { Fragment } from 'react';
import { Word } from './Word';
import { Examples } from './Examples';
import { DBWord, WordData } from '../types';

type DefinitionProps = {
    result: WordData['results'][0];
    wordsAll?: DBWord[];
    textSourceSubmitted: string | null;
    onWordClick: (word: string, addToLearn?: boolean) => void;
    hideExamples?: boolean;
    disableWordClick?: boolean;
};

export function Definition({
    result,
    wordsAll,
    textSourceSubmitted,
    onWordClick,
    hideExamples,
    disableWordClick,
}: DefinitionProps) {
    return (
        <div className="text-white">
            {result.partOfSpeech && (
                <span className="font-bold">{result.partOfSpeech}: </span>
            )}
            {result.definition.split(' ').map((word, wordIndex, array) => (
                <Fragment key={`${word}-${wordIndex}`}>
                    <Word
                        word={word}
                        allWords={wordsAll}
                        currentWord={textSourceSubmitted}
                        onClick={onWordClick}
                        disableWordClick={disableWordClick}
                    />
                    {wordIndex < array.length - 1 ? ' ' : ''}
                </Fragment>
            ))}
            {!hideExamples && result.examples && result.examples.length > 0 && (
                <Examples
                    examples={result.examples}
                    wordsAll={wordsAll}
                    textSourceSubmitted={textSourceSubmitted}
                    onWordClick={onWordClick}
                />
            )}
        </div>
    );
}
