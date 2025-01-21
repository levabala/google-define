import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../providers';
import type { DBWord } from '../types';

export function useMutationAIDefinition() {
    return useMutation({
        mutationFn: async (word: string) => {
            const response = await fetch('/api/words/ai/definition', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word }),
            });
            const data = await response.json();
            return data;
        },
        onMutate: async (word) => {
            await queryClient.cancelQueries({ queryKey: ['wordsAll'] });
            
            const previousWords = queryClient.getQueryData<DBWord[]>(['wordsAll']);
            
            if (previousWords) {
                queryClient.setQueryData<DBWord[]>(['wordsAll'], (old) => 
                    old?.map(w => w.word === word ? {
                        ...w,
                        raw: {
                            ...w.raw,
                            ai_definition: { 
                                definition: 'Generating AI definition...',
                                partOfSpeech: '',
                                examples: []
                            }
                        }
                    } : w)
                );
            }
            
            return { previousWords };
        },
        onError: (err, word, context) => {
            queryClient.setQueryData(['wordsAll'], context?.previousWords);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['wordsAll'] });
        }
    });
}
