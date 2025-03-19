import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useTRPC } from "../trpc/client";
import { normalizeWord } from "../helpers";

export function useAddWordMutation() {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const mutateOptions = trpc.addWord.mutationOptions({
        onSuccess: (res) => {
            queryClient.setQueryData(trpc.getWordsAll.queryKey(), (prev) => [
                res,
                ...(prev || []),
            ]);
        },
    });

    const mutateOptionsPatched: typeof mutateOptions = {
        ...mutateOptions,
        mutationFn: mutateOptions.mutationFn
            ? ({ value, ...rest }) =>
                  mutateOptions.mutationFn!({
                      value: normalizeWord(value),
                      ...rest,
                  })
            : undefined,
    };

    return useMutation(mutateOptionsPatched);
}
