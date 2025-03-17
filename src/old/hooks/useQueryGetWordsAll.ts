import { useQuery } from '@tanstack/react-query';
import { WordsAllResponseSchema } from '@/app/old/schemas';

export function useQueryGetWordsAll() {
    return useQuery({
        queryKey: ['wordsAll'],
        queryFn: async () => {
            const res = await fetch('/api/words/all');
            if (!res.ok) {
                throw new Error('Failed to fetch words');
            }
            const data = await res.json();
            return WordsAllResponseSchema.parse(data);
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
