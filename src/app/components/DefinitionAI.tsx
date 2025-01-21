import { Fragment } from 'react';
import { Word } from './Word';
import { Examples } from './Examples';
import { DBWord } from '../types';

type DefinitionAIProps = {
    definition: string;
    partOfSpeech?: string;
    examples?: string[];
    wordsAll?: DBWord[];
    textSourceSubmitted: string | null;
    onWordClick: (word: string, addToLearn?: boolean) => void;
};

export function DefinitionAI({
    definition,
    partOfSpeech,
    examples,
    wordsAll,
    textSourceSubmitted,
    onWordClick,
}: DefinitionAIProps) {
    return (
        <div className="text-white">
            {partOfSpeech && (
                <span 
                    className="font-bold text-blue-400"
                    title="AI-generated definition"
                >
                    {partOfSpeech}: 
                </span>
            )}
                {definition.split(' ').map((word, index, array) => (
                    <Fragment key={`${word}-${index}`}>
                        <Word
                            word={word}
                            allWords={wordsAll}
                            currentWord={textSourceSubmitted}
                            onClick={onWordClick}
                        />
                        {index < array.length - 1 ? ' ' : ''}
                    </Fragment>
                ))}
            {examples && (
                <Examples
                    examples={examples}
                    wordsAll={wordsAll}
                    textSourceSubmitted={textSourceSubmitted}
                    onWordClick={onWordClick}
                />
            )}
        </div>
    );
}
