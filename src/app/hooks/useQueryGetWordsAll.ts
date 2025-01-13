import { useQuery } from '@tanstack/react-query';
import { DBWord } from '../types';

export function useQueryGetWordsAll() {
    return useQuery({
        queryKey: ['dictionaryAll'],
        queryFn: async () => {
            console.log('refetch all!');
            const res = await fetch('/api/words/all').catch(() => null);

            return (await res?.json()) as DBWord[];
        },
    });
}
