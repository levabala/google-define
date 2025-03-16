import { Fragment } from 'react';
import { Word } from './Word';
import { Examples } from './Examples';
import { DBWord, WordData } from '../types';

type DefinitionProps = {
    result: NonNullable<WordData['results']>[number] & {
        source?: 'ai' | 'dictionary';
    };
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
        <div className="text-white" data-testid={`definition-${result.partOfSpeech || 'unknown'}`}>
            {result.partOfSpeech && (
                <span 
                    className="font-bold"
                    style={{ color: result.source === 'ai' ? '#60a5fa' : 'inherit' }}
                    title={result.source === 'ai' ? 'AI-generated definition' : undefined}
                >
                    {result.partOfSpeech}:{' '}
                </span>
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
