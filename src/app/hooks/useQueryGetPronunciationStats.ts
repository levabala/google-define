import { useQuery } from '@tanstack/react-query';
import { WordStats } from '../types';

export function useQueryGetPronunciationStats(word: string) {
    return useQuery<WordStats>({
        queryKey: ['pronunciationStats', word],
        queryFn: async () => {
            if (!word) return null;
            const response = await fetch(
                `/api/training/pronounce?word=${encodeURIComponent(word)}`,
            );
            if (!response.ok) {
                throw new Error('Failed to fetch pronunciation stats');
            }
            return response.json();
        },
        enabled: !!word,
    });
}
