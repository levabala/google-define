"use client";
import { useMemo, JSX, Fragment } from "react";
import { Word } from "./Word";
import { isAlphanumericCharCodeOrDash } from "../utils";

export const TextAsWords: React.FC<{
    text: string;
}> = ({ text }) => {
    const parts = useMemo(() => {
        const parts: JSX.Element[] = [];
        let currentWord = "";
        let currentNonWord = "";

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charCode = text.charCodeAt(i);

            // Check if character is alphanumeric
            const isAlphaNum = isAlphanumericCharCodeOrDash(charCode);

            if (isAlphaNum) {
                // If we were building a non-word, flush it
                if (currentNonWord) {
                    parts.push(
                        <Fragment key={parts.length}>
                            {currentNonWord}
                        </Fragment>
                    );
                    currentNonWord = "";
                }
                currentWord += char;
            } else {
                // If we were building a word, flush it
                if (currentWord) {
                    parts.push(<Word key={parts.length} word={currentWord} />);
                    currentWord = "";
                }
                currentNonWord += char;
            }
        }

        // Flush any remaining content
        if (currentWord) {
            parts.push(<Word key={parts.length} word={currentWord} />);
        }
        if (currentNonWord) {
            parts.push(
                <Fragment key={parts.length}>{currentNonWord}</Fragment>
            );
        }

        return parts;
    }, [text]);

    return <>{parts}</>;
};

