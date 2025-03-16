import { useMutation } from "@tanstack/react-query";
import { queryClient } from '../queryClient';
import { AIDefinitionSchema } from "../schemas";
import { updateWordsAllCache } from "../v1/helpers/updateWordsAllCacheche";

export function useMutationAIDefinition() {
    return useMutation({
        mutationFn: async (word: string) => {
            const response = await fetch("/api/words/ai/definition", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ word }),
            });
            if (!response.ok) {
                throw new Error('Failed to get AI definition');
            }
            const data = await response.json();
            return AIDefinitionSchema.parse(data);
        },
        onSuccess: async (data, word) => {
            updateWordsAllCache(queryClient, words =>
                words.map(w =>
                    w.word === word
                        ? {
                              ...w,
                              ai_definition: data,
                          }
                        : w,
                ),
            );
        },
    });
}
