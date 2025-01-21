import { Fragment } from 'react';
import { Word } from './Word';
import { Examples } from './Examples';
import { DBWord, WordData } from '../types';

type DefinitionProps = {
    result: NonNullable<WordData['results']>[number];
    wordsAll?: DBWord[];
    textSourceSubmitted: string | null;
    onWordClick: (word: string, addToLearn?: boolean) => void;
    hideExamples?: boolean;
    disableWordClick?: boolean;
    word: string;
};

export function Definition({
    result,
    wordsAll,
    textSourceSubmitted,
    onWordClick,
    hideExamples,
    disableWordClick,
    word,
}: DefinitionProps) {
    const aiDefinition = wordsAll?.find(w => w.word === word)?.raw.ai_definition;
    return (
        <div className="text-white">
            {result.partOfSpeech && (
                <span className="font-bold">{result.partOfSpeech}: </span>
            )}
            {result.definition.split(' ').map((word: string, wordIndex: number, array: string[]) => (
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
