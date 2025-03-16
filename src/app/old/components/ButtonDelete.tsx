import { DBWord } from '../types';
import { useMutationDeleteWord } from '../../hooks/useMutationDeleteWordord';

type ButtonDeleteProps = {
    textSourceSubmitted: string | null;
    wordsAll?: DBWord[];
    setTextSourceCurrent: (value: string) => void;
    setTextSourceSubmitted: (value: string) => void;
    className?: string;
};

import { cn } from '../../../utils/cn';
import { ButtonBase } from './ButtonBase';

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
        <ButtonBase
            onClick={() => {
                if (!textSourceSubmitted) return;
                deleteWordMutation.mutate(textSourceSubmitted, {
                    onSuccess: () => {
                        setTextSourceCurrent('');
                        setTextSourceSubmitted('');
                    },
                });
            }}
            className={cn('bg-red-600 hover:bg-red-700 text-white', className)}
            testId="delete-button"
        >
            Delete
        </ButtonBase>
    );
}
