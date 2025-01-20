import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { DBWordSchema } from '../schemas';

export function useQueryGetWordsAll() {
    return useQuery({
        queryKey: ['dictionaryAll'],
        queryFn: async () => {
            console.log('refetch all!');
            const res = await fetch('/api/words/all').catch(() => null);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = await res?.json();
            return z.array(DBWordSchema).parse(data.map((word: any) => {
                word.raw = JSON.parse(word.raw);
                return word;
            }));
        },
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
    });
}
