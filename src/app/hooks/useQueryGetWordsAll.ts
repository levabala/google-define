import { useQuery } from '@tanstack/react-query';

export function useQueryGetWordsAll() {
    return useQuery({
        queryKey: ['dictionaryAll'],
        queryFn: async () => {
            console.log('refetch all!');
            const res = await fetch('/api/words/all').catch(() => null);

            const data = await res?.json();
            const validated = WordsAllResponseSchema.parse(data);
            return validated.map((word) => {
                word.raw = JSON.parse(word.raw);
                return word;
            });
        },
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
    });
}
