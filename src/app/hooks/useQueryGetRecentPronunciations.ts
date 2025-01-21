import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

const RecentPronunciationsSchema = z.array(z.boolean());

export function useQueryGetRecentPronunciations(word: string) {
    return useQuery({
        queryKey: ['recentPronunciations', word],
        enabled: !!word,
        queryFn: async () => {
            const url = new URL(
                '/api/training/pronouncesRecent',
                window.location.origin,
            );
            url.searchParams.set('word', word);
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error('Failed to fetch recent pronunciations');
            }
            const data = await res.json();
            return RecentPronunciationsSchema.parse(data);
        },
        staleTime: 0,
    });
}
