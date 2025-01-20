import { QueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { DBWordSchema } from '../schemas';
import { DBWord } from '../types';

export function updateWordsAllCache(
    queryClient: QueryClient,
    updater: (words: DBWord[]) => DBWord[],
) {
    queryClient.setQueryData<DBWord[]>(['dictionaryAll'], old => {
        if (!old) return old;
        const updated = updater(old);
        return z.array(DBWordSchema).parse(updated);
    });
}
