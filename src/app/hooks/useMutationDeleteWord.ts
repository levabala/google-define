import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../providers';

export function useMutationDeleteWord() {
    return useMutation({
        mutationFn: async (word: string) => {
            const response = await fetch(`/api/words/one?word=${word}`, {
                method: 'DELETE',
            });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dictionaryAll'] });
        },
    });
}
