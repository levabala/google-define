import { DBWord } from '../types';
import { useMutationMarkWord } from '../hooks/useMutationMarkWord';
import { cn } from '../../utils/cn';
import { ButtonBase } from './ButtonBase';

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
        <ButtonBase
            onClick={() => {
                if (!textSourceSubmitted) return;
                markWordMutation.mutate({
                    word: textSourceSubmitted,
                    status: 'LEARNED',
                });
            }}
            disabled={isLearned || isLoading}
            className={cn(
                isLearned
                    ? 'bg-green-800 ring-2 ring-green-400'
                    : 'bg-green-600 hover:bg-green-700 text-white',
                className
            )}
            isLoading={isLoading}
            testId="learned-button"
        >
            Learned
        </ButtonBase>
    );
}
