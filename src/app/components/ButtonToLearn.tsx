import { DBWord } from '../types';
import { useMutationMarkWord } from '../hooks/useMutationMarkWord';

type ButtonToLearnProps = {
    textSourceSubmitted: string | null;
    wordsAll?: DBWord[];
    className?: string;
};

import { cn } from '../../utils/cn';

export function ButtonToLearn({
    textSourceSubmitted,
    wordsAll,
    className,
}: ButtonToLearnProps) {
    const markWordMutation = useMutationMarkWord();
    const isToLearn =
        wordsAll?.find(
            w => w.word.toLowerCase() === textSourceSubmitted?.toLowerCase(),
        )?.status === 'TO_LEARN';

    return (
        <button
            type="button"
            onClick={() => {
                if (!textSourceSubmitted) return;
                markWordMutation.mutate({
                    word: textSourceSubmitted,
                    status: 'TO_LEARN',
                });
            }}
            disabled={isToLearn}
            className={cn('px-2 py-1 text-white rounded', 
                isToLearn
                    ? 'bg-yellow-800 cursor-not-allowed ring-2 ring-yellow-400'
                    : 'bg-yellow-600 hover:bg-yellow-700',
                className
            )}
            data-testid="to-learn-button"
        >
            To Learn
        </button>
    );
}
