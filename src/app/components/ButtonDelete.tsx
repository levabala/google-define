import { DBWord } from '../types';
import { queryClient } from '../providers';

type ButtonDeleteProps = {
    textSourceSubmitted: string | null;
    wordsAll?: DBWord[];
    setTextSourceCurrent: (value: string) => void;
    setTextSourceSubmitted: (value: string) => void;
};

export function ButtonDelete({
    textSourceSubmitted,
    wordsAll,
    setTextSourceCurrent,
    setTextSourceSubmitted,
}: ButtonDeleteProps) {
    const exists = wordsAll?.some(
        w => w.word.toLowerCase() === textSourceSubmitted?.toLowerCase(),
    );

    if (!exists) return null;

    return (
        <button
            type="button"
            onClick={async () => {
                if (!textSourceSubmitted) return;
                await fetch(`/api/words/one?word=${textSourceSubmitted}`, {
                    method: 'DELETE',
                });
                queryClient.invalidateQueries({
                    queryKey: ['dictionaryAll'],
                });
                setTextSourceCurrent('');
                setTextSourceSubmitted('');
            }}
            className="ml-2 px-2 py-1 text-white rounded bg-red-600 hover:bg-red-700"
        >
            Delete
        </button>
    );
}
