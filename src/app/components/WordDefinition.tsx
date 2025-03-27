"use client";

import { Button } from "@/components/ui/button";
import { WordClickable } from "./WordClickable";
import { TextAsWords } from "./TextAsWords";
import { ChevronDown } from "lucide-react";
import { Definition } from "../types";
import { useState } from "react";
import { cn } from "@/utils/cn";

export const WordDefinition: React.FC<{
    definition: Definition;
    showTranscription?: boolean;
    hidePartOfSpeech?: boolean;
}> = ({
    definition: { definition, partOfSpeech, examples, pronunciation, synonyms },
    showTranscription,
    hidePartOfSpeech,
}) => {
    const [synonymsExpanded, setSynonymsExpanded] = useState(false);

    const transcription = showTranscription && pronunciation;

    return (
        <div className="flex flex-col">
            <div>
                {hidePartOfSpeech ? null : (
                    <span className="text-xs text-muted-foreground">
                        ({partOfSpeech}):{" "}
                    </span>
                )}
                {transcription ? (
                    <span className="text-sm text-muted-foreground">
                        {transcription}{" "}
                    </span>
                ) : null}
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
            {synonyms ? (
                <div className="flex gap-1">
                    <div
                        className={cn(
                            "text-sm whitespace-pre-wrap",
                            !synonymsExpanded &&
                                "overflow-hidden whitespace-pre overflow-ellipsis",
                        )}
                    >
                        <span className="text-xs text-muted-foreground">
                            similar:{" "}
                        </span>
                        {synonyms.map((synonym, i, arr) => (
                            <>
                                <WordClickable key={synonym + i} word={synonym}>
                                    {synonym}
                                </WordClickable>
                                {i !== arr.length - 1 ? (
                                    <span>{", "}</span>
                                ) : null}
                            </>
                        ))}
                    </div>
                    {synonymsExpanded ? null : (
                        <Button
                            size="icon"
                            variant="outline"
                            className="self-center h-[20px] w-[20px]"
                            onClick={() => setSynonymsExpanded(true)}
                        >
                            <ChevronDown />
                        </Button>
                    )}
                </div>
            ) : null}
        </div>
    );
};
