import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../providers';

type MarkWordStatus = 'TO_LEARN' | 'LEARNED' | 'HIDDEN';

export function useMutationMarkWord() {
    return useMutation({
        mutationFn: async ({ word, status }: { word: string; status: MarkWordStatus }) => {
            const response = await fetch('/api/words/one', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word, status }),
            });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dictionaryAll'] });
        },
    });
}
