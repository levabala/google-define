import { useQuery } from '@tanstack/react-query';

export function useQueryGetWordsAll() {
    return useQuery({
        queryKey: ['dictionaryAll'],
        queryFn: async () => {
            console.log('refetch all!');
            const res = await fetch('/api/words/all').catch(() => null);

            const data = await res?.json();
            return data.map((word: { raw: string }) => {
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
