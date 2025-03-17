import { useQuery } from '@tanstack/react-query';
import { WordStatsSchema } from '../schemas';

export function useQueryGetPronunciationStats(word: string) {
    return useQuery({
        queryKey: ['pronunciationStats', word],
        queryFn: async () => {
            if (!word) return null;
            const response = await fetch(
                `/api/training/pronounce?word=${encodeURIComponent(word)}`,
            );
            if (!response.ok) {
                throw new Error('Failed to fetch pronunciation stats');
            }
            const data = await response.json();
            return WordStatsSchema.parse(data);
        },
        enabled: !!word,
    });
}
