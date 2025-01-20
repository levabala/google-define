import { useQuery } from '@tanstack/react-query';
import { WordStatsSchema } from '../schemas';

export function fetchGetGuessStats(word: string) {
    return fetch(`/api/training/guess?word=${encodeURIComponent(word)}`);
}

export const useQueryGetGuessStats = (word: string) => {
    return useQuery({
        queryKey: ['guessStats', word],
        queryFn: async () => {
            if (!word) return null;

            const response = await fetchGetGuessStats(word);
            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }
            const data = await response.json();
            return WordStatsSchema.parse(data);
        },
        enabled: !!word,
    });
};
