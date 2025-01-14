import { useQuery } from '@tanstack/react-query';
import { WordStats } from '../types';

export function fetchGetGuessStats(word: string) {
    return fetch(`/api/training/guess?word=${encodeURIComponent(word)}`);
}

export const useQueryGetGuessStats = (word: string) => {
    return useQuery<WordStats>({
        queryKey: ['guessStats', word],
        queryFn: async () => {
            if (!word) return null;

            const response = await fetchGetGuessStats(word);

            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }
            return response.json();
        },
        enabled: !!word,
    });
};
