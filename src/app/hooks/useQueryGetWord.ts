import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../providers';
import { WordData, WordStatus, DBWord } from '../types';

export function useQueryGetWord(
    textSource: string,
    initialStatus?: WordStatus,
) {
    return useQuery({
        queryKey: ['dictionary', 'en', textSource],
        enabled: textSource !== '',
        queryFn: async () => {
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
                queryClient.setQueryData(
                    ['dictionaryAll'],
                    [...currentWords, newWord],
                );
            }

            return json as WordData;
        },
        retry: false,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
    });
}
