import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../queryClient';
import { updateWordsAllCache } from '../v1/helpers/updateWordsAllCacheche';
import { SuccessResponseSchema } from '@/app/old/schemas';

export function useMutationDeleteWord() {
    return useMutation({
        mutationFn: async (word: string) => {
            const response = await fetch(`/api/words/one?word=${word}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete word');
            }
            const data = await response.json();
            return SuccessResponseSchema.parse(data);
        },
        onSuccess: (data, word) => {
            updateWordsAllCache(queryClient, words =>
                words.filter(w => w.word !== word),
            );
        },
    });
}
