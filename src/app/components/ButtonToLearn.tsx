import { DBWord } from '../types';
import { useMutationMarkWord } from '../hooks/useMutationMarkWord';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';
import { ButtonBase } from './ButtonBase';

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
        <ButtonBase
            onClick={() => {
                if (!textSourceSubmitted) return;
                markWordMutation.mutate({
                    word: textSourceSubmitted,
                    status: 'TO_LEARN',
                });
            }}
            disabled={isToLearn || isLoading}
            className={cn(
                isToLearn
                    ? 'bg-yellow-800 ring-2 ring-yellow-400'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white',
                className
            )}
            testId="to-learn-button"
        >
            {isLoading ? 'Marking...' : 'To Learn'}
        </ButtonBase>
    );
}
