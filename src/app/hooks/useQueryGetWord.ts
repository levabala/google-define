import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../providers';
import { WordData, WordStatus, DBWord } from '../types';
import { useQueryGetWordsAll } from './useQueryGetWordsAll';

export async function fetchGetWord(textSource: string) {
    const url = new URL('/api/words/one', window.location.origin);
    url.searchParams.set('word', textSource);
    
    const res = await fetch(url).catch(() => null);
    if (res === null) throw new Error();
    
    const json = await res.json();
    if (!json?.word) throw new Error();
    
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
