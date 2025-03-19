"use client";
import { TextAsWords } from "./TextAsWords";
import { Definition } from "../types";

export const WordDefinition: React.FC<{ definition: Definition; }> = ({
    definition: { definition, partOfSpeech, examples },
}) => {
    return (
        <div className="flex flex-col">
            <div>
                <span className="text-xs">({partOfSpeech}): </span>
                <span>
                    <TextAsWords text={definition} />
                </span>
            </div>
            <ul className="list-disc pl-5">
                {examples.map((example, i) => (
                    <li key={example + i} className="text-sm">
                        <TextAsWords text={example} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

