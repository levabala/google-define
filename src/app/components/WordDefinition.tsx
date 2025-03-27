"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { WordClickable } from "./WordClickable";
import { TextAsWords } from "./TextAsWords";
import { ChevronDown } from "lucide-react";
import throttle from "lodash/throttle";
import { Definition } from "../types";
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
    const [hasOverflow, setHasOverflow] = useState(true);

    const synonymsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = synonymsContainerRef.current;
        if (!container) return;

        const checkOverflow = throttle(() => {
            const hasOverflow = container.scrollWidth > container.clientWidth;
            setHasOverflow(hasOverflow);
        }, 1000);

        checkOverflow();
        window.addEventListener("resize", checkOverflow);
        return () => window.removeEventListener("resize", checkOverflow);
    }, [synonyms]);

    const transcription = showTranscription && pronunciation;

    return (
        <div className="flex flex-col gap-1">

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
                        ref={synonymsContainerRef}
                        className={cn(
                            "text-sm whitespace-pre-wrap",
                            !synonymsExpanded &&
                                "overflow-hidden whitespace-pre overflow-ellipsis",
                        )}
                    >
                        <span className="text-xs text-muted-foreground">
                            similar:{" "}
                        </span>
                        {synonyms.slice(0, 5).map((synonym, i, arr) => (
                            <Fragment key={synonym + i}>
                                <WordClickable word={synonym}>
                                    {synonym}
                                </WordClickable>
                                {i !== arr.length - 1 ? (
                                    <span>{", "}</span>
                                ) : null}
                            </Fragment>
                        ))}
                    </div>
                    {synonymsExpanded ? null : (
                        <Button
                            size="icon"
                            variant="outline"
                            className={cn(
                                "self-center h-[20px] w-[20px] duration-200 opacity-100 ease-in-out transition-opacity",
                                !hasOverflow && "opacity-0",
                            )}
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
