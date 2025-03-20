"use client";
import { WordDefinition } from "./WordDefinition";
import { Definition } from "../types";

export const WordDefinitionsAI: React.FC<{
    definitions: Definition[];
    shouldShowPronounciations: boolean;
}> = ({ definitions, shouldShowPronounciations }) => {
    return (
        <div className="flex flex-col gap-2 grow">
            {definitions.map((definition) => (
                <WordDefinition
                    key={definition.definition + definition.partOfSpeech}
                    definition={definition}
                    showTranscription={shouldShowPronounciations}
                />
            ))}
        </div>
    );
};
