"use client";
import { TextAsWords } from "./TextAsWords";
import { Definition } from "../types";

export const WordDefinition: React.FC<{
    definition: Definition;
    showTranscription?: boolean;
    hideExamples?: boolean;
    hidePartOfSpeech?: boolean;
}> = ({
    definition: { definition, partOfSpeech, examples, pronunciation },
    showTranscription,
    hideExamples,
    hidePartOfSpeech,
}) => {
    const transcription = showTranscription && pronunciation;

    return (
        <div className="flex flex-col">
            <div>
                {hidePartOfSpeech ? null : (
                    <span className="text-xs">({partOfSpeech}): </span>
                )}
                {transcription ? (
                    <span className="text-sm text-muted-foreground">
                        {transcription}{' '}
                    </span>
                ) : null}
                <span>
                    <TextAsWords text={definition} />
                </span>
            </div>
            {hideExamples ? null : (
                <ul className="list-disc pl-5">
                    {examples.map((example, i) => (
                        <li key={example + i} className="text-sm">
                            <TextAsWords text={example} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
