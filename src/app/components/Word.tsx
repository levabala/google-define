import { DBWord } from "../types";

export type WordProps = {
    word: string;
    allWords?: DBWord[];
    onClick: (word: string, addToLearn?: boolean) => void;
    small?: boolean;
    currentWord?: string | null;
    isLoading?: boolean;
    disableWordClick?: boolean;
    // TODO: convert to isObscured
    displayMode?: 'normal' | 'obscured';
};

function getStatusColor(matchedWord: DBWord | undefined): string {
    if (matchedWord?.status === "LEARNED") return "text-green-400";
    if (matchedWord?.status === "TO_LEARN") return "text-yellow-400";
    return "";
}

export function Word({
    word,
    allWords,
    onClick,
    small,
    currentWord,
    isLoading,
    disableWordClick,
    displayMode = 'normal',
}: WordProps) {
    const matchedWord = allWords?.find(
        (w) => w.word.toLowerCase() === word.toLowerCase(),
    );

    const statusColor = getStatusColor(matchedWord);

    return (
        <span
            onClick={
                isLoading || disableWordClick
                    ? undefined
                    : (e) => onClick(word, e.metaKey)
            }
            className={`${
                isLoading
                    ? "animate-pulse bg-gray-700 text-transparent rounded cursor-default"
                    : disableWordClick
                      ? "cursor-default"
                      : "cursor-pointer hover:underline"
            } ${statusColor} ${small ? "text-sm" : ""} ${
                matchedWord ? "" : "text-gray-400"
            } ${currentWord?.toLowerCase() === word.toLowerCase() ? "underline" : ""}`}
            style={{ minWidth: "1rem" }}
            data-testid="word"
        >
            <span 
                className={cn(
                    displayMode === 'obscured' && [
                        'relative after:content-[""] after:absolute after:left-0 after:top-0',
                        'after:w-full after:h-full after:bg-white after:rounded-sm'
                    ]
                )}
            >
                {word}
            </span>
        </span>
    );
}
