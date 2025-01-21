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
        // Sort words by status priority (none -> to learn -> learned) then alphabetically
        const statusOrder = { undefined: 0, TO_LEARN: 1, LEARNED: 2 };
        const sorted = updated.sort((a, b) => {
            const statusA = statusOrder[a.status as keyof typeof statusOrder] || 0;
            const statusB = statusOrder[b.status as keyof typeof statusOrder] || 0;
            if (statusA !== statusB) return statusA - statusB;
            return a.word.localeCompare(b.word);
        });
        return z.array(DBWordSchema).parse(sorted);
    });
}
