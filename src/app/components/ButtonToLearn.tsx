import { DBWord } from '../types';
import { useMutationMarkWord } from '../hooks/useMutationMarkWord';

type ButtonToLearnProps = {
    textSourceSubmitted: string | null;
    wordsAll?: DBWord[];
};

export function ButtonToLearn({
    textSourceSubmitted,
    wordsAll,
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
            className={`ml-2 px-2 py-1 text-white rounded ${
                isToLearn
                    ? 'bg-yellow-800 cursor-not-allowed ring-2 ring-yellow-400'
                    : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
        >
            To Learn
        </button>
    );
}
