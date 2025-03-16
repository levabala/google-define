import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../queryClient";
import { WordStatus } from "../types";
import { updateWordsAllCache } from "../v1/helpers/updateWordsAllCacheche";
import { DBWordSchema } from "../schemas";
import { toast } from "react-toastify";

export function useMutationAddWord() {
    return useMutation({
        mutationFn: async ({
            word,
            initialStatus,
        }: {
            word: string;
            initialStatus?: WordStatus;
        }) => {
            const response = await fetch("/api/words/one", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ word, initialStatus }),
            });
            if (!response.ok) {
                throw new Error("Failed to add word");
            }
            const data = await response.json();
            return DBWordSchema.parse(data);
        },
        onSuccess: (data) => {
            updateWordsAllCache(queryClient, (words) => [...words, data]);
        },
        onError: () => {
            toast.error("Failed to add word");
        },
    });
}
