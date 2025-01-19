import { Definition } from './Definition';
import { DBWord } from '../types';
import { WordData } from '../types';

type DefinitionsProps = {
    results: WordData['results'];
    wordsAll?: DBWord[];
    textSourceSubmitted: string | null;
    onWordClick: (word: string, addToLearn?: boolean) => void;
    isLoading?: boolean;
};

export function Definitions({
    results,
    wordsAll,
    textSourceSubmitted,
    onWordClick,
    isLoading,
}: DefinitionsProps) {
    if (!results || isLoading) {
        return <Spinner />;
    }

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
