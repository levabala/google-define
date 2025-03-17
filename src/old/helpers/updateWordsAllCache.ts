import { QueryClient } from '@tanstack/react-query';
import { sortWordsByStatus } from './sortWords';
import { z } from 'zod';
import { DBWordSchema } from '../schemas';
import { DBWord } from '../types';

export function updateWordsAllCache(
    queryClient: QueryClient,
    updater: (words: DBWord[]) => DBWord[],
) {
    queryClient.setQueryData<DBWord[]>(['wordsAll'], old => {
        const updated = updater(old || []);
        // Use shared sorting logic
        const sorted = sortWordsByStatus(updated);
        return z.array(DBWordSchema).parse(sorted);
    });
}
