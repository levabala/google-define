import { Definition } from './Definition';
import { DBWord } from '../types';
import { WordData } from '../types';

type DefinitionsProps = {
    results: WordData['results'];
    wordsAll?: DBWord[];
    textSourceSubmitted: string | null;
    onWordClick: (word: string, addToLearn?: boolean) => void;
};

export function Definitions({
    results,
    wordsAll,
    textSourceSubmitted,
    onWordClick,
}: DefinitionsProps) {
    return (
        <div className="flex flex-col gap-2">
            {results.map(result => (
                <Definition
                    key={result.definition}
                    result={result}
                    wordsAll={wordsAll}
                    textSourceSubmitted={textSourceSubmitted}
                    onWordClick={onWordClick}
                />
            ))}
        </div>
    );
}
