import { DBWord } from '../types';
import { useMutationMarkWord } from '../hooks/useMutationMarkWord';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

type ButtonLearnedProps = {
    textSourceSubmitted: string | null;
    wordsAll?: DBWord[];
    className?: string;
};

export function ButtonLearned({ 
    textSourceSubmitted, 
    wordsAll,
    className 
}: ButtonLearnedProps) {
    const markWordMutation = useMutationMarkWord();
    const isLearned = wordsAll?.find(
        w => w.word.toLowerCase() === textSourceSubmitted?.toLowerCase()
    )?.status === 'LEARNED';
    const isLoading = markWordMutation.isPending;

    return (
        <button
            type="button"
            onClick={() => {
                if (!textSourceSubmitted) return;
                markWordMutation.mutate({
                    word: textSourceSubmitted,
                    status: 'LEARNED',
                });
            }}
            disabled={isLearned || isLoading}
            className={cn(
                'px-2 py-1 text-white rounded inline-flex items-center justify-center gap-2 w-[100px]', 
                isLearned
                    ? 'bg-green-800 cursor-not-allowed ring-2 ring-green-400'
                    : 'bg-green-600 hover:bg-green-700',
                className
            )}
            data-testid="learned-button"
        >
            {isLoading || true ? (
                <>
                    <Spinner className="h-4 w-4" />
                    <span>Marking...</span>
                </>
            ) : (
                'Learned'
            )}
        </button>
    );
}
