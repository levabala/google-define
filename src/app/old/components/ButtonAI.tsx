import { DBWord } from "../types";
import { useMutationAIDefinition } from "../../hooks/useMutationAIDefinitionion";
import { cn } from "../../../utils/cn";
import { ButtonBase } from "./ButtonBase";

type ButtonAIProps = {
    textSourceSubmitted: string | null;
    wordsAll?: DBWord[];
    className?: string;
};

export function ButtonAI({
    textSourceSubmitted,
    wordsAll,
    className,
}: ButtonAIProps) {
    const mutation = useMutationAIDefinition();

    const exists = wordsAll?.some(
        (w) => w.word.toLowerCase() === textSourceSubmitted?.toLowerCase(),
    );

    if (!exists) return null;

    return (
        <ButtonBase
            onClick={() => {
                if (!textSourceSubmitted) return;
                mutation.mutate(textSourceSubmitted);
            }}
            className={cn(
                "bg-blue-600 hover:bg-blue-700 text-white",
                className,
            )}
            isLoading={mutation.isPending}
            testId="ai-button"
        >
            AI Definition
        </ButtonBase>
    );
}
