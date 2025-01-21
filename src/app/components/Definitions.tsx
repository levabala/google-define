import { Definition } from './Definition';
import { DBWord } from '../types';
import { WordData } from '../types';

type DefinitionsProps = {
    results: WordData['results'];
    wordsAll?: DBWord[];
    textSourceSubmitted: string | null;
    onWordClick: (word: string, addToLearn?: boolean) => void;
    word: string;
};

export function Definitions({
    results,
    wordsAll,
    textSourceSubmitted,
    onWordClick,
    word,
}: DefinitionsProps) {
    return (
        <div className="flex flex-col gap-2">
            {results?.map(result => (
                <Definition
                    key={result.definition}
                    result={result}
                    wordsAll={wordsAll}
                    textSourceSubmitted={textSourceSubmitted}
                    onWordClick={onWordClick}
                    word={word}
                />
            ))}
            
            {wordsAll && (
                <div className="mt-4 p-2 bg-blue-900 rounded">
                    <div className="text-sm text-blue-300 mb-1 flex items-center gap-2">
                        <span>AI Definition</span>
                        <span className="bg-blue-700 text-white px-2 py-1 rounded text-xs">AI</span>
                    </div>
                    <p className="text-white">
                        {wordsAll.find(w => w.word === word)?.raw.ai_definition?.definition || 'Generating AI definition...'}
                    </p>
                    {wordsAll.find(w => w.word === word)?.raw.ai_definition?.examples && (
                        <Examples
                            examples={wordsAll.find(w => w.word === word)?.raw.ai_definition?.examples || []}
                            wordsAll={wordsAll}
                            textSourceSubmitted={textSourceSubmitted}
                            onWordClick={onWordClick}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
