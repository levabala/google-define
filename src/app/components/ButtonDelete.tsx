import { DBWord } from '../types';
import { useMutationDeleteWord } from '../hooks/useMutationDeleteWord';

type ButtonDeleteProps = {
    textSourceSubmitted: string | null;
    wordsAll?: DBWord[];
    setTextSourceCurrent: (value: string) => void;
    setTextSourceSubmitted: (value: string) => void;
    className?: string;
};

import { cn } from '../../utils/cn';

export function ButtonDelete({
    textSourceSubmitted,
    wordsAll,
    setTextSourceCurrent,
    setTextSourceSubmitted,
    className,
}: ButtonDeleteProps) {
    const deleteWordMutation = useMutationDeleteWord();

    const exists = wordsAll?.some(
        w => w.word.toLowerCase() === textSourceSubmitted?.toLowerCase(),
    );

    if (!exists) return null;

    return (
        <button
            type="button"
            onClick={() => {
                if (!textSourceSubmitted) return;
                deleteWordMutation.mutate(textSourceSubmitted, {
                    onSuccess: () => {
                        setTextSourceCurrent('');
                        setTextSourceSubmitted('');
                    },
                });
            }}
            className={cn('px-2 py-1 text-white rounded inline-flex items-center justify-center gap-2 w-[100px] bg-red-600 hover:bg-red-700', className)}
            data-testid="delete-button"
        >
            Delete
        </button>
    );
}
