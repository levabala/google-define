import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WordStats, TrainingGuess } from '../types';
import { SuccessResponseSchema } from '../schemas';

export function useMutationTrainingGuess() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            word,
            success,
            definition,
        }: TrainingGuess) => {
            const response = await fetch('/api/training/guess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word, success, definition }),
            });
            const result = await response.json();
            return SuccessResponseSchema.parse(result);
        },
        onMutate: async ({ word, success }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['guessStats', word] });

            // Snapshot the previous value
            const previousStats = queryClient.getQueryData<WordStats>([
                'guessStats',
                word,
            ]);

            // Optimistically update the stats
            queryClient.setQueryData<WordStats>(['guessStats', word], old => {
                if (!old) {
                    return {
                        total: 1,
                        successful: success ? 1 : 0,
                        failed: success ? 0 : 1,
                        ratio: success ? 1 : 0,
                    };
                }

                const newSuccessful = old.successful + (success ? 1 : 0);
                const newFailed = old.failed + (success ? 0 : 1);
                const newTotal = old.total + 1;

                return {
                    total: newTotal,
                    successful: newSuccessful,
                    failed: newFailed,
                    ratio: newSuccessful / newTotal,
                };
            });

            // Return context with the previous stats
            return { previousStats };
        },
        onError: (err, { word }, context) => {
            // Rollback to the previous stats on error
            queryClient.setQueryData(
                ['guessStats', word],
                context?.previousStats,
            );
        },
        onSettled: (data, error, { word }) => {
            // Refetch to ensure we have the correct data
            queryClient.invalidateQueries({ queryKey: ['guessStats', word] });
        },
    });
}
