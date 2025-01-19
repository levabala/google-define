import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../providers';
import { WordData, WordStatus, DBWord } from '../types';
import { useQueryGetWordsAll } from './useQueryGetWordsAll';

export async function fetchGetWord(
    textSource: string,
    initialStatus?: WordStatus,
) {
    const url = new URL('/api/words/one', window.location.origin);

    url.searchParams.set('word', textSource);

    if (initialStatus) {
        url.searchParams.set('initialStatus', initialStatus);
    }

    const res = await fetch(url).catch(() => null);

    if (res === null) {
        throw new Error();
    }

    const json = await res.json();

    if (!json?.word) {
        throw new Error();
    }

    // Optimistically update the words list
    const currentWords =
        queryClient.getQueryData<DBWord[]>(['dictionaryAll']) || [];
    const newWord: DBWord = {
        word: json.word,
        raw: json,
        status: initialStatus || 'NONE',
        created_at: new Date().toISOString(),
    };

    // Only add if the word doesn't exist
    if (!currentWords.some(w => w.word === json.word)) {
        queryClient.setQueryData(['dictionaryAll'], [...currentWords, newWord]);
    }

    return json as WordData;
}

export function useQueryGetWord(textSource: string) {
    const { data, isFetching } = useQueryGetWordsAll();

    return useQuery<WordData | undefined>({
        queryKey: ['dictionary', 'en', textSource],
        enabled: textSource !== '',
        queryFn: () => {
            if (!data || isFetching) {
                return new Promise(() => {});
            }

            return data.find(word => word.word === textSource)?.raw;
        },
    });
}
