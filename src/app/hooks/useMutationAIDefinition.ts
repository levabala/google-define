import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../providers";
import type { DBWord } from "../types";

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
            const data = await response.json();
            return data;
        },
        onSuccess: async (data, word) => {
            queryClient.setQueryData<DBWord[]>(["wordsAll"], (old) =>
                old?.map((w) =>
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
