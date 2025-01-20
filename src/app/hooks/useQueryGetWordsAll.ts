import { useQuery } from '@tanstack/react-query';
import { WordsAllResponseSchema } from '@/app/schemas';
import type { DBWord } from '@/app/types';

export function useQueryGetWordsAll() {
    return useQuery({
        queryKey: ['dictionaryAll'],
        queryFn: async () => {
            console.log('refetch all!');
            const res = await fetch('/api/words/all').catch(() => null);

            const data = await res?.json();
            const validated = WordsAllResponseSchema.parse(data);
            return validated;
        },
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
    });
}
