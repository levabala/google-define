import { Definition } from './Definition';
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
    const result = {
        definition,
        partOfSpeech: partOfSpeech ?? null,
        examples,
        source: 'ai' as const,
    };

    return (
        <Definition
            result={result}
            wordsAll={wordsAll}
            textSourceSubmitted={textSourceSubmitted}
            onWordClick={onWordClick}
        />
    );
}
