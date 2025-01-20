import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../providers';
import { WordStats, DBPronounciation, DBPronounciationInput } from '../types';

type MutationContext = {
    previousStats: WordStats | undefined;
    previousRecent: boolean[] | undefined;
};

export function useMutationPronunciation() {
    return useMutation({
        mutationFn: async (data: DBPronounciationInput) => {
            const response = await fetch('/api/training/pronounce', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            return response.json();
        },
        onMutate: async (
            newData: DBPronounciationInput,
        ): Promise<MutationContext> => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({
                queryKey: ['pronunciationStats', newData.word],
            });
            await queryClient.cancelQueries({
                queryKey: ['recentPronunciations', newData.word],
            });

            // Get current data
            const previousStats = queryClient.getQueryData<WordStats>([
                'pronunciationStats',
                newData.word,
            ]);
            const previousRecent = queryClient.getQueryData<boolean[]>([
                'recentPronunciations',
                newData.word,
            ]);

            // Optimistically update stats
            queryClient.setQueryData<WordStats>(
                ['pronunciationStats', newData.word],
                old => {
                    if (!old)
                        return {
                            total: 1,
                            successful: newData.success ? 1 : 0,
                            failed: newData.success ? 0 : 1,
                            ratio: newData.success ? 1 : 0,
                        };

                    return {
                        total: old.total + 1,
                        successful: old.successful + (newData.success ? 1 : 0),
                        failed: old.failed + (newData.success ? 0 : 1),
                        ratio:
                            (old.successful + (newData.success ? 1 : 0)) /
                            (old.total + 1),
                    };
                },
            );

            // Optimistically update recent
            queryClient.setQueryData<boolean[]>(
                ['recentPronunciations', newData.word],
                (old = []) => {
                    const newRecent = [newData.success, ...old].slice(0, 5);
                    return newRecent;
                },
            );

            return { previousStats, previousRecent };
        },
        onError: (err, newData, context?: MutationContext) => {
            // Rollback on error
            if (context?.previousStats) {
                queryClient.setQueryData<WordStats>(
                    ['pronunciationStats', newData.word],
                    context.previousStats,
                );
            }
            if (context?.previousRecent) {
                queryClient.setQueryData<boolean[]>(
                    ['recentPronunciations', newData.word],
                    context.previousRecent,
                );
            }
        },
        onSettled: (data, error, variables) => {
            // Always refetch after error or success
            queryClient.invalidateQueries({
                queryKey: ['pronunciationStats', variables.word],
            });
            queryClient.invalidateQueries({
                queryKey: ['recentPronunciations', variables.word],
            });
        },
    });
}
