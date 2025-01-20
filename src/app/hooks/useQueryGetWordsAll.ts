import { useQuery } from '@tanstack/react-query';
import { WordsAllResponseSchema } from '@/app/schemas';

export function useQueryGetWordsAll() {
    return useQuery({
        queryKey: ['dictionaryAll'],
        queryFn: async () => {
            console.log('refetch all!');
            const res = await fetch('/api/words/all').catch(() => null);

            const data = await res?.json();
            console.log(data);
            const validated = WordsAllResponseSchema.parse(data);
            return validated;
        },
        retry: false,
        throwOnError: true,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
    });
}
