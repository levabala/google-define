import { Definition } from "./Definition";
import { Examples } from "./Examples";
import { WordData } from "../types";

type DefinitionsProps = {
    results: WordData["results"];
    textSourceSubmitted: string | null;
    onWordClick: (word: string, addToLearn?: boolean) => void;
    aiDefinition?: {
        definition: string;
        examples?: string[];
    };
};

export function Definitions({
    results,
    textSourceSubmitted,
    onWordClick,
    aiDefinition,
}: DefinitionsProps) {
    return (
        <div className="flex flex-col gap-2">
            {aiDefinition && (
                <div className="mt-4 p-2 bg-blue-900 rounded">
                    <div className="text-sm text-blue-300 mb-1 flex items-center gap-2">
                        <span>AI Definition</span>
                        <span className="bg-blue-700 text-white px-2 py-1 rounded text-xs">
                            AI
                        </span>
                    </div>
                    <p className="text-white">{aiDefinition.definition}</p>
                    {aiDefinition.examples && (
                        <Examples
                            examples={aiDefinition.examples}
                            textSourceSubmitted={textSourceSubmitted}
                            onWordClick={onWordClick}
                        />
                    )}
                </div>
            )}
            
            {results?.map((result) => (
                <Definition
                    key={result.definition}
                    result={result}
                    textSourceSubmitted={textSourceSubmitted}
                    onWordClick={onWordClick}
                />
            ))}
        </div>
    );
}
