import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../queryClient';

type SpellingInput = {
    word: string;
    answer: string;
};

type SpellingResult = {
    success: boolean;
    errors: number;
};

export function useMutationSpelling() {
    return useMutation({
        mutationFn: async (data: SpellingInput) => {
            const response = await fetch('/api/training/spelling', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit spelling attempt');
            }
            
            return response.json() as Promise<SpellingResult>;
        },
        onSuccess: (data, variables) => {
            // Invalidate any related queries
            queryClient.invalidateQueries({
                queryKey: ['trainingStats', variables.word],
            });
        },
    });
}
