"use client";
import { WordDefinition } from "./WordDefinition";
import { DefinitionSchema } from "../types";
import { Json } from "@/database.types";
import { type } from "arktype";

export const WordDefinitionsAI: React.FC<{ definitionRaw: Json }> = ({
    definitionRaw,
}) => {
    const definitionList = DefinitionSchema.array()(definitionRaw);

    if (definitionList instanceof type.errors) {
        return <div className="text-muted">invalid definition</div>;
    }

    return (
        <div className="flex flex-col gap-2 grow">
            {definitionList.map((definition) => (
                <WordDefinition
                    key={definition.definition + definition.partOfSpeech}
                    definition={definition}
                />
            ))}
        </div>
    );
};
