import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../providers';
import { WordStatus } from '../types';

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
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dictionaryAll'] });
        },
    });
}
