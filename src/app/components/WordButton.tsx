import { useCurrentWordStr } from "../hooks/useCurrentWordStr";
import { useWordsAllQuery } from "../hooks/useWordsAllQuery";
import { Button } from "@/components/ui/button";
import { areWordsEqual } from "../helpers";
import { cn } from "@/utils/cn";

export const WordButton: React.FC<
    {
        word: string;
    } & React.ComponentProps<typeof Button>
> = ({ word, className, onClick, ...props }) => {
    const wordsAll = useWordsAllQuery();
    const { currentWordStr, setCurrentWordStr } = useCurrentWordStr();

    const wordData = wordsAll.data?.find((wordInner) =>
        areWordsEqual(wordInner.word, word),
    );
    const isHighlighted = areWordsEqual(currentWordStr || "", word);
    const isLearned = wordData?.status === "LEARNED";
    const hasNoAIDefinition = !wordData?.ai_definition;

    return (
        <Button
            variant="link"
            className={cn(
                "flex max-w-full text-primary-foreground",
                isLearned && "text-success decoration-success",
                isHighlighted && "font-bold",
                className,
            )}
            onClick={(e) => {
                setCurrentWordStr(word);
                onClick?.(e);
            }}
            {...props}
        >
            <span
                className={cn(
                    "block w-full overflow-hidden text-ellipsis whitespace-nowrap",
                    hasNoAIDefinition && "text-muted-foreground",
                    isLearned && "text-success decoration-success",
                )}
            >
                {word}
            </span>
        </Button>
    );
};
