import { DBWord } from '../types';
import { useMutationMarkWord } from '../hooks/useMutationMarkWord';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

type ButtonToLearnProps = {
    textSourceSubmitted: string | null;
    wordsAll?: DBWord[];
    className?: string;
};

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
    const isLoading = markWordMutation.isPending;

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
            disabled={isToLearn || isLoading}
            className={cn('px-2 py-1 text-white rounded flex items-center justify-center gap-2 min-w-[100px]', 
                isToLearn
                    ? 'bg-yellow-800 cursor-not-allowed ring-2 ring-yellow-400'
                    : 'bg-yellow-600 hover:bg-yellow-700',
                className
            )}
            data-testid="to-learn-button"
        >
            {isLoading ? (
                <>
                    <Spinner className="h-4 w-4" />
                    <span>Marking...</span>
                </>
            ) : (
                'To Learn'
            )}
        </button>
    );
}
