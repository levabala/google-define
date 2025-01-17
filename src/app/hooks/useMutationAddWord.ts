import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../providers';
import { WordStatus } from '../types';
import { updateWordsAllCache } from '../helpers/updateWordsAllCache';
import { DBWordSchema } from '../schemas';

export function useMutationAddWord() {
    return useMutation({
        mutationFn: async ({
            word,
            initialStatus,
        }: {
            word: string;
            initialStatus?: WordStatus;
        }) => {
            const response = await fetch('/api/words/one', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word, initialStatus }),
            });
            const data = await response.json();
            return DBWordSchema.parse(data);
        },
        onSuccess: (data) => {
            updateWordsAllCache(queryClient, words => [
                ...words,
                data,
            ]);
        },
    });
}
