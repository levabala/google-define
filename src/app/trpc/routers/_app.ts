import { baseProcedure, Context, createTRPCRouter } from "../init";
import { DefinitionSchema } from "@/app/types";
import { type } from "arktype";
import { ai } from "@/ai";
import { AI_DEFINITION_EXPIRATION_DURATION_MS } from "@/app/constants";

async function fetchAIDefinition(ctx: Context, wordStr: string) {
    const { error } = await ctx.supabase
        .from("word")
        .update({
            ai_definition_request_start_date: new Date().toISOString(),
        })
        .eq("word", wordStr)
        .eq("user", ctx.userLogin);

    if (error) {
        throw new Error("failed to update ai_definition_request_start_date", {
            cause: error,
        });
    }

    // Query AI for definition since we don't have it
    const aiResponse = await ai({
        messages: [
            {
                role: "system",
                content:
                    "You are an English dictionary assistant. Provide a clear definition that does not use the target word or any of its derivatives, along with its part of speech and 2 example sentences in JSON format. The definition should be understandable without knowing the target word. Do not capitalize the first letter of sentences in the definition or examples.",
            },
            {
                role: "user",
                content: `Provide the definition of the word "${wordStr}" in JSON format with the top-level property "definitions" as an array. Each element of the array should include the following fields: definition (string), partOfSpeech (string), and examples (array of 2 strings). Each element should represent a distinct meaning of the word. Without formatting. Raw json`,
            },
        ],
        model: "openai/gpt-4o-mini",
        response_format: { type: "json_object" },
    });

    // Parse and validate AI response
    // Handle both streaming and non-streaming responses
    const content =
        "choices" in aiResponse
            ? aiResponse.choices[0].message.content
            : await (async () => {
                  let result = "";
                  for await (const chunk of aiResponse) {
                      result += chunk.choices[0]?.delta?.content || "";
                  }
                  return result;
              })();

    if (!content) {
        throw new Error("No content received from AI");
    }

    console.log("raw ai response:", content);
    console.log("json ai response:", JSON.parse(content));

    const aiDefinition = DefinitionSchema.array().assert(
        JSON.parse(content)?.definitions,
    );

    console.log({ aiDefinition });

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

                    return wordExistingRecovered;
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
                fetchAIDefinition(opts.ctx, value);
            }

            if (!wordCreated) {
                throw new Error("failed to create the word");
            }

            return wordCreated;
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
            const { userLogin: user, supabase } = opts.ctx;
            const { wordStr } = opts.input;

            const { data: wordExisting } = await supabase
                .from("word")
                .select()
                .eq("word", wordStr)
                .eq("user", user)
                .maybeSingle();

            if (!wordExisting) {
                throw new Error("the word doesnt exist");
            }

            const timePast = wordExisting.ai_definition_request_start_date
                ? Date.now() -
                  new Date(
                      wordExisting.ai_definition_request_start_date,
                  ).valueOf()
                : null;

            if (timePast && timePast < AI_DEFINITION_EXPIRATION_DURATION_MS) {
                throw new Error("cannot request a new definition. too soon");
            }

            const aiDefinition = await fetchAIDefinition(opts.ctx, wordStr);

            // Update existing word record with AI definition
            const { error } = await supabase
                .from("word")
                .update({
                    ai_definition: aiDefinition,
                })
                .eq("word", wordStr)
                .eq("user", user);

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            return aiDefinition;
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

        return wordsList;
    }),
});

export type AppRouter = typeof appRouter;
