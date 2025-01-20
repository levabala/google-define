import { QueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { DBWordSchema } from '../schemas';

export function updateWordsAllCache(
    queryClient: QueryClient,
    updater: (words: z.infer<typeof DBWordSchema>[]) => z.infer<typeof DBWordSchema>[],
) {
    queryClient.setQueryData<z.infer<typeof DBWordSchema>[]>(['dictionaryAll'], old => {
        if (!old) return old;
        const updated = updater(old);
        return z.array(DBWordSchema).parse(updated);
    });
}
