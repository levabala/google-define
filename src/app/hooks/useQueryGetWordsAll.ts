import { useQuery } from '@tanstack/react-query';
import { DBWord } from '../types';

export function useQueryGetWordsAll() {
    return useQuery({
        queryKey: ['dictionaryAll'],
        queryFn: async () => {
            console.log('refetch all!');
            const res = await fetch('/api/words/all').catch(() => null);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (await res?.json()).map((word: any) => {
                word.raw = JSON.parse(word.raw);

                return word as DBWord;
            }) as DBWord[];
        },
    });
}
