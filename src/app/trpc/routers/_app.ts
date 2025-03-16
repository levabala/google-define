import { baseProcedure, createTRPCRouter } from "../init";
import { type } from "arktype";

export const appRouter = createTRPCRouter({
    addWord: baseProcedure
        .input(
            type({
                value: "string",
            }).assert,
        )
        .mutation(async (opts) => {
            const { userLogin: user, supabase } = opts.ctx;
            const { value } = opts.input;

            const { data: wordExisting } = await supabase
                .from("word")
                .select()
                .eq("word", value)
                .eq("user", user)
                .maybeSingle();

            if (wordExisting) {
                throw new Error("the word is already added");
            }

            const { data: wordCreated } = await supabase
                .from("word")
                .insert({
                    word: value,
                    raw: {},
                    status: "NONE",
                    user,
                })
                .select()
                .single();

            if (!wordCreated) {
                throw new Error("failed to create the word");
            }

            return wordCreated;
        }),
    getWordsAll: baseProcedure.query(async (opts) => {
        const { userLogin: user, supabase } = opts.ctx;

        const { data: wordsList } = await supabase
            .from("word")
            .select()
            .eq("user", user);

        if (!wordsList) {
            throw new Error("unexpected");
        }

        return wordsList;
    }),
});

export type AppRouter = typeof appRouter;
