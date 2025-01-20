import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../providers';
import { updateWordsAllCache } from '../helpers/updateWordsAllCache';

export function useMutationDeleteWord() {
    return useMutation({
        mutationFn: async (word: string) => {
            const response = await fetch(`/api/words/one?word=${word}`, {
                method: 'DELETE',
            });
            return response.json();
        },
        onSuccess: (data, word) => {
            updateWordsAllCache(queryClient, words =>
                words.filter(w => w.word !== word),
            );
        },
    });
}
