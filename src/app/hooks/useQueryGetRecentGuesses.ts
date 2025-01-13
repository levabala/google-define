import { useQuery } from '@tanstack/react-query';

export function useQueryGetRecentGuesses(word: string) {
    return useQuery({
        queryKey: ['recentGuesses', word],
        enabled: word !== '',
        queryFn: async () => {
            const url = new URL(
                '/api/training/guessesRecent',
                window.location.origin,
            );
            url.searchParams.set('word', word);
            const res = await fetch(url).catch(() => null);

            if (res === null) {
                throw new Error();
            }

            return res.json() as Promise<boolean[]>;
        },
        staleTime: 0,
    });
}
