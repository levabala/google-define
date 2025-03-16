"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tables } from "@/database.types";
import { useTRPC } from "./trpc/client";

const Word: React.FC<{ word: Tables<"word"> }> = ({ word }) => {
    return <div className="flex">{word.word}</div>;
};

export default function Main() {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const addWord = useMutation(trpc.addWord.mutationOptions());
    const wordsAll = useQuery(trpc.getWordsAll.queryOptions());

    return (
        <main className="flex h-screen flex-col gap-2 p-2">
            <div className="flex-grow">
                {wordsAll.data
                    ? wordsAll.data.map((word) => {
                          return <Word key={word.word} word={word} />;
                      })
                    : "none"}
            </div>
            <form
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                    e.preventDefault();

                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);

                    const data = {
                        value: formData.get("value")?.valueOf() as string,
                    };

                    addWord.mutate(data, {
                        onSuccess: (res) => {
                            queryClient.setQueryData(
                                trpc.getWordsAll.queryKey(),
                                (prev) => [...(prev || []), res],
                            );

                            form.reset();
                        },
                        onSettled: (res) => console.log(res),
                    });
                }}
            >
                <Input name="value" placeholder="word/phrase" className="" />
                <Button
                    type="submit"
                    className=""
                    isLoading={addWord.isPending}
                >
                    look up
                </Button>
            </form>
        </main>
    );
}
