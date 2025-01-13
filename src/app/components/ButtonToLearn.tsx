import { DBWord } from '../types';
import { queryClient } from '../providers';

type ButtonToLearnProps = {
    textSourceSubmitted: string | null;
    wordsAll?: DBWord[];
};

export function ButtonToLearn({ textSourceSubmitted, wordsAll }: ButtonToLearnProps) {
    const isToLearn = wordsAll?.find(
        w => w.word.toLowerCase() === textSourceSubmitted?.toLowerCase()
    )?.status === 'TO_LEARN';

    return (
        <button
            type="button"
            onClick={async () => {
                if (!textSourceSubmitted) return;
                await fetch('/api/words/one', {
                    method: 'POST',
                    body: JSON.stringify({
                        word: textSourceSubmitted,
                        status: 'TO_LEARN',
                    }),
                });
                queryClient.invalidateQueries({
                    queryKey: ['dictionaryAll'],
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
