import { Fragment } from 'react';
import { Word } from './Word';
import { Examples } from './Examples';
import { DBWord } from '../types';

type DefinitionAIProps = {
    definition: string;
    examples?: string[];
    wordsAll?: DBWord[];
    textSourceSubmitted: string | null;
    onWordClick: (word: string, addToLearn?: boolean) => void;
};

export function DefinitionAI({
    definition,
    examples,
    wordsAll,
    textSourceSubmitted,
    onWordClick,
}: DefinitionAIProps) {
    return (
        <div className="mt-4 p-2 bg-blue-900 rounded">
            <div className="text-sm text-blue-300 mb-1 flex items-center gap-2">
                <span>AI Definition</span>
                <span className="bg-blue-700 text-white px-2 py-1 rounded text-xs">
                    AI
                </span>
            </div>
            <div className="text-white">
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
            </div>
            {examples && (
                <Examples
                    examples={examples}
                    textSourceSubmitted={textSourceSubmitted}
                    onWordClick={onWordClick}
                />
            )}
        </div>
    );
}
