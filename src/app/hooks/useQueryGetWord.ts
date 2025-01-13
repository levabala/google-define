import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../providers';
import { WordData } from '../types';

export function useQueryGetWord(textSource: string) {
    return useQuery({
        queryKey: ['dictionary', 'en', textSource],
        enabled: textSource !== '',
        queryFn: async () => {
            const res = await fetch(`/api/words/one?word=${textSource}`).catch(
                () => null,
            );

            if (res === null) {
                throw new Error();
            }

            const json = await res.json();

            if (!json?.word) {
                throw new Error();
            }

            queryClient.invalidateQueries({ queryKey: ['dictionaryAll'] });

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
