import { QueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { DBWordSchema } from '../schemas';
import { DBWord } from '../types';

export function updateWordsAllCache(
    queryClient: QueryClient,
    updater: (words: DBWord[]) => DBWord[],
) {
    queryClient.setQueryData<DBWord[]>(['wordsAll'], old => {
        if (!old) return old;
        const updated = updater(old);
        // Sort words alphabetically by their word property
        const sorted = updated.sort((a, b) => a.word.localeCompare(b.word));
        return z.array(DBWordSchema).parse(sorted);
    });
}
