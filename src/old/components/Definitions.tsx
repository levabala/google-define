import { Definition } from "./Definition";
import { DefinitionAI } from "./DefinitionAI";
import { WordData, DBWord } from "../types";

type DefinitionsProps = {
    results: WordData["results"];
    textSourceSubmitted: string | null;
    onWordClick: (word: string, addToLearn?: boolean) => void;
    aiDefinition?: {
        definition: string;
        partOfSpeech?: string;
        examples?: string[];
    };
    wordsAll?: DBWord[];
};

export function Definitions({
    results,
    textSourceSubmitted,
    onWordClick,
    aiDefinition,
    wordsAll,
}: DefinitionsProps) {
    return (
        <div className="flex flex-col gap-2" data-testid="definitions-container">
            {aiDefinition && (
                <DefinitionAI
                    definition={aiDefinition.definition}
                    partOfSpeech={aiDefinition.partOfSpeech}
                    examples={aiDefinition.examples}
                    wordsAll={wordsAll}
                    textSourceSubmitted={textSourceSubmitted}
                    onWordClick={onWordClick}
                />
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
