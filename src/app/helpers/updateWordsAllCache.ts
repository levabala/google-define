import { QueryClient } from '@tanstack/react-query';
import { DBWord } from '../types';

export function updateWordsAllCache(
    queryClient: QueryClient,
    updater: (words: DBWord[]) => DBWord[],
) {
    queryClient.setQueryData<DBWord[]>(['dictionaryAll'], old => {
        if (!old) return old;
        return updater(old);
    });
}
