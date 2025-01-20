import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../providers';
import { updateWordsAllCache } from '../helpers/updateWordsAllCache';
import { SuccessResponseSchema } from '@/app/schemas';

export function useMutationDeleteWord() {
    return useMutation({
        mutationFn: async (word: string) => {
            const response = await fetch(`/api/words/one?word=${word}`, {
                method: 'DELETE',
            });
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
