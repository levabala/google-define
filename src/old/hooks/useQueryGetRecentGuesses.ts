import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

const RecentGuessesSchema = z.array(z.boolean());

export function useQueryGetRecentGuesses(word: string) {
    return useQuery({
        queryKey: ['recentGuesses', word],
        enabled: !!word,
        queryFn: async () => {
            const url = new URL(
                '/api/training/guessesRecent',
                window.location.origin,
            );
            url.searchParams.set('word', word);
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error('Failed to fetch recent guesses');
            }
            const data = await res.json();
            return RecentGuessesSchema.parse(data);
        },
        staleTime: 0,
    });
}
