import { DBWord } from '../types';
import { queryClient } from '../providers';

type ButtonLearnedProps = {
    textSourceSubmitted: string | null;
    wordsAll?: DBWord[];
};

export function ButtonLearned({ textSourceSubmitted, wordsAll }: ButtonLearnedProps) {
    const isLearned = wordsAll?.find(
        w => w.word.toLowerCase() === textSourceSubmitted?.toLowerCase()
    )?.status === 'LEARNED';

    return (
        <button
            type="button"
            onClick={async () => {
                if (!textSourceSubmitted) return;
                await fetch('/api/words/one', {
                    method: 'POST',
                    body: JSON.stringify({
                        word: textSourceSubmitted,
                        status: 'LEARNED',
                    }),
                });
                queryClient.invalidateQueries({
                    queryKey: ['dictionaryAll'],
                });
            }}
            disabled={isLearned}
            className={`ml-2 px-2 py-1 text-white rounded ${
                isLearned
                    ? 'bg-green-800 cursor-not-allowed ring-2 ring-green-400'
                    : 'bg-green-600 hover:bg-green-700'
            }`}
        >
            Learned
        </button>
    );
}