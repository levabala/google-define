import { QueryClient } from '@tanstack/react-query';
import { DBWordSchema } from '../schemas';

export function updateWordsAllCache(
    queryClient: QueryClient,
    updater: (words: DBWord[]) => DBWord[],
) {
    queryClient.setQueryData<z.infer<typeof DBWordSchema>[]>(['dictionaryAll'], old => {
        if (!old) return old;
        const updated = updater(old);
        return z.array(DBWordSchema).parse(updated);
    });
}
