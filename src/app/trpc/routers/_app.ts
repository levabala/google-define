import { baseProcedure, Context, createTRPCRouter } from "../init";
import { DefinitionSchema, WordSchema } from "@/app/types";
import { type } from "arktype";
import { ai } from "@/ai";

const createPrompt = (
    wordStr: string,
): Parameters<typeof ai>[0]["messages"] => [
    {
        role: "system",
        content:
            "You are an English dictionary assistant. Provide a clear definition that does not use the target word or any of its derivatives, along with its part of speech and 2 example sentences in JSON format. The definition should be understandable without knowing the target word. Do not capitalize the first letter of sentences in the definition or examples. The examples must contain the target word.",
    },
    {
        role: "user",
        content: `
                    Provide the definitions of the word "${wordStr}" in JSON format with the top-level property "definitions" as an array.
                    Like { "definitions": [{ ... }, { ... }] }
                    Each element of the array should include the following fields: definition (string), partOfSpeech (string), pronunciation (string) and examples (array of 2 strings).
                    Each element should represent a distinct meaning of the word. If the word has completely different meanings - include them as the definitions as well.
                    The pronunciation should reflect the original word exaclty, not a variation of it.
                    Pronunciation must be american.
                    Format the pronunciation in IPA notation.
                    No code block formatting for json, emit just json in the response.
                `,
    },
];

async function parseAiResponse(
    aiResponse: NonNullable<Awaited<ReturnType<typeof ai>>>,
) {
    // Parse and validate AI response
    // Handle both streaming and non-streaming responses
    return "choices" in aiResponse
        ? aiResponse.choices[0].message.content
        : await (async () => {
              let result = "";
              for await (const chunk of aiResponse) {
                  result += chunk.choices[0]?.delta?.content || "";
              }
              return result;
          })();
}

async function updateAIDefinition(ctx: Context, wordStr: string) {
    ctx.supabase
        .from("word")
        .update({
            ai_definition_request_start_date: new Date().toISOString(),
        })
        .eq("word", wordStr)
        .eq("user", ctx.userLogin)
        .then(({ error }) => {
            if (error) {
                console.error(
                    "failed to update ai_definition_request_start_date",
                    {
                        cause: error,
                    },
                );
            }
        });

    const [aiResponseFast, aiResponseLong] = [
        ai({
            messages: createPrompt(wordStr),
            model: "google/gemini-flash-1.5-8b",
            response_format: { type: "json_object" },
        }),
        ai({
            messages: createPrompt(wordStr),
            model: "deepseek/deepseek-r1",
            response_format: { type: "json_object" },
        }),
    ];

    const content = await parseAiResponse(await aiResponseFast);

    if (!content) {
        throw new Error("No content received from AI");
    }

    console.log("raw ai response:", content);

    const aiDefinition = DefinitionSchema.array().assert(
        JSON.parse(content)?.definitions,
    );

    ctx.supabase
        .from("word")
        .update({
            ai_definition: aiDefinition,
        })
        .eq("word", wordStr)
        .eq("user", ctx.userLogin)
        .then(({ error }) => {
            if (error) {
                console.error(error);
            }
        });

    aiResponseLong.then(async (res) => {
        const content = await parseAiResponse(res);

        if (!content) {
            console.error("No content received from AI for the long request");
            return;
        }

        console.log("raw long ai response:", content);

        const aiDefinition = DefinitionSchema.array().assert(
            JSON.parse(content)?.definitions,
        );

        const { error: errorUpdateAIDefinition } = await ctx.supabase
            .from("word")
            .update({
                ai_definition: aiDefinition,
            })
            .eq("word", wordStr)
            .eq("user", ctx.userLogin)
            .select()
            .single();

        if (errorUpdateAIDefinition) {
            console.error(`Database error: ${errorUpdateAIDefinition.message}`);
        }
    });

    return aiDefinition;
}

export const appRouter = createTRPCRouter({
    addWord: baseProcedure
        .input(
            type({
                value: "string",
                shouldFetchAIDefinition: "boolean?",
            }).assert,
        )
        .mutation(async (opts) => {
            const { userLogin: user, supabase } = opts.ctx;
            const { value, shouldFetchAIDefinition } = opts.input;

            const { data: wordExisting } = await supabase
                .from("word")
                .select()
                .eq("word", value)
                .eq("user", user)
                .maybeSingle();

            if (wordExisting) {
                if (wordExisting.status === "HIDDEN") {
                    const { data: wordExistingRecovered, error } =
                        await supabase
                            .from("word")
                            .update({
                                status: "NONE",
                            })
                            .eq("word", wordExisting.word)
                            .eq("user", user)
                            .select()
                            .single();

                    if (error) {
                        throw new Error("failed to add the word");
                    }

                    if (
                        shouldFetchAIDefinition &&
                        !wordExistingRecovered.ai_definition
                    ) {
                        updateAIDefinition(opts.ctx, value);
                    }

                    return parseWord(wordExistingRecovered);
                }

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

            if (shouldFetchAIDefinition) {
                updateAIDefinition(opts.ctx, value);
            }

            if (!wordCreated) {
                throw new Error("failed to create the word");
            }

            return parseWord(wordCreated);
        }),
    wordUpdateIfLearned: baseProcedure
        .input(
            type({
                word: "string",
                isLearned: "boolean",
            }).assert,
        )
        .mutation(async (opts) => {
            const { userLogin: user, supabase } = opts.ctx;
            const { word, isLearned } = opts.input;

            const { data: wordExisting } = await supabase
                .from("word")
                .select()
                .eq("word", word)
                .eq("user", user)
                .maybeSingle();

            if (!wordExisting) {
                throw new Error("the word doesnt exist");
            }

            const { data: wordUpdated, error } = await supabase
                .from("word")
                .update({
                    status: isLearned ? "LEARNED" : "TO_LEARN",
                })
                .eq("word", word)
                .eq("user", user)
                .select()
                .single();

            if (error) {
                throw new Error("failed to update the word");
            }

            return parseWord(wordUpdated);
        }),
    deleteWord: baseProcedure
        .input(
            type({
                word: "string",
            }).assert,
        )
        .mutation(async (opts) => {
            const { userLogin: user, supabase } = opts.ctx;
            const { word } = opts.input;

            const { data: wordExisting } = await supabase
                .from("word")
                .select()
                .eq("word", word)
                .eq("user", user)
                .maybeSingle();

            if (!wordExisting) {
                throw new Error("the word doesnt exist");
            }

            const { error } = await supabase
                .from("word")
                .update({
                    status: "HIDDEN",
                })
                .eq("word", word)
                .eq("user", user);

            if (error) {
                throw new Error("failed to delete the word");
            }
        }),
    requestAIDefinition: baseProcedure
        .input(
            type({
                wordStr: "string",
            }).assert,
        )
        .mutation(async (opts) => {
            const { wordStr } = opts.input;

            return updateAIDefinition(opts.ctx, wordStr);
        }),
    getWordsAll: baseProcedure.query(async (opts) => {
        const { userLogin: user, supabase } = opts.ctx;

        const { data: wordsList } = await supabase
            .from("word")
            .select()
            .eq("user", user)
            .neq("status", "HIDDEN")
            .order("created_at", { ascending: false });

        if (!wordsList) {
            throw new Error("unexpected");
        }

        return wordsList.map(parseWord);
    }),
    getWordTrainingStat: baseProcedure
        .input(type({ word: "string" }))
        .query(async (opts) => {
            const { userLogin: user, supabase } = opts.ctx;
            const { word } = opts.input;

            const [totalAttemptsResult, successfulAttemptsResult] =
                await Promise.all([
                    supabase
                        .from("training")
                        .select("*", { count: "exact" })
                        .eq("word", word)
                        .eq("user", user),
                    supabase
                        .from("training")
                        .select("*", { count: "exact" })
                        .eq("word", word)
                        .eq("user", user)
                        .eq("is_success", true),
                ]);

            if (totalAttemptsResult.error || successfulAttemptsResult.error) {
                throw new Error("failed to get stat", {
                    cause: {
                        totalAttemptsResult: totalAttemptsResult.error,
                        successfulAttemptsResult:
                            successfulAttemptsResult.error,
                    },
                });
            }

            const totalAttempts = totalAttemptsResult.count || 0;
            const successfulAttempts = successfulAttemptsResult.count || 0;

            return {
                totalAttempts,
                successfulAttempts,
            };
        }),
    recordQuizChoice: baseProcedure
        .input(
            type({
                word: "string",
                definition: "string",
                isSuccess: "boolean",
            }).assert,
        )
        .mutation(async (opts) => {
            const { userLogin: user, supabase } = opts.ctx;
            const { word, definition, isSuccess } = opts.input;

            const { data: wordExisting } = await supabase
                .from("word")
                .select()
                .eq("word", word)
                .eq("user", user)
                .maybeSingle();

            if (!wordExisting) {
                throw new Error("the word doesnt exist");
            }

            const { error } = await supabase.from("training").insert({
                word,
                definition,
                user,
                is_success: isSuccess,
            });

            if (error) {
                throw new Error("failed to record the quiz choice", {
                    cause: error,
                });
            }
        }),
});

function parseWord(word: object) {
    const wordResult = WordSchema.omit("ai_definition")(word);
    if (wordResult instanceof type.errors) {
        throw new Error("word parse error", { cause: wordResult });
    }

    const ai_definitionResult = WordSchema.pick("ai_definition")(word);

    return {
        ...wordResult,
        ai_definition:
            ai_definitionResult instanceof type.errors
                ? null
                : ai_definitionResult.ai_definition,
    };
}

export type AppRouter = typeof appRouter;
