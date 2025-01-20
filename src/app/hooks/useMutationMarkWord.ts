import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../providers';
import { updateWordsAllCache } from '../helpers/updateWordsAllCache';
import { WordStatus } from '../types';

export function useMutationMarkWord() {
    return useMutation({
        mutationFn: async ({ word, status }: { word: string; status: WordStatus }) => {
            const response = await fetch('/api/words/one', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word, status }),
            });
            return response.json();
        },
        onSuccess: (data, { word, status }) => {
            updateWordsAllCache(queryClient, words =>
                words.map(w =>
                    w.word === word ? { ...w, status } : w,
                ),
            );
        },
    });
}
