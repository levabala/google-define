import { baseProcedure, Context, createTRPCRouter } from "../init";
import { DefinitionSchema, WordSchema } from "@/app/types";
import { trainingTable, wordTable } from "@/db/schema";
import { eq, not, and, sql } from "drizzle-orm";
import { logger } from "../logger";
import { type } from "arktype";
import { ai } from "@/ai";
import { db } from "@/db";

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
    await db
        .update(wordTable)
        .set({
            aiDefinitionRequestStartDate: new Date().toISOString(),
        })
        .where(
            and(eq(wordTable.word, wordStr), eq(wordTable.user, ctx.userLogin)),
        );

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

    logger.verbose("raw ai response", { content: JSON.parse(content) });
    logger.info("json ai response", { content: JSON.parse(content) });

    const aiDefinition = DefinitionSchema.array().assert(
        JSON.parse(content)?.definitions,
    );

    await db
        .update(wordTable)
        .set({
            aiDefinition: aiDefinition,
        })
        .where(
            and(eq(wordTable.word, wordStr), eq(wordTable.user, ctx.userLogin)),
        );

    aiResponseLong.then(async (res) => {
        const content = await parseAiResponse(res);

        if (!content) {
            logger.error("No content received from AI for the long request");
            return;
        }

        logger.verbose("raw long ai response", {
            content: JSON.parse(content),
        });
        logger.info("json long ai response", { content: JSON.parse(content) });

        const aiDefinition = DefinitionSchema.array().assert(
            JSON.parse(content)?.definitions,
        );

        await db
            .update(wordTable)
            .set({
                aiDefinition: aiDefinition,
            })
            .where(
                and(
                    eq(wordTable.word, wordStr),
                    eq(wordTable.user, ctx.userLogin),
                ),
            );
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
            const { userLogin: user } = opts.ctx;
            const { value, shouldFetchAIDefinition } = opts.input;

            const [wordExisting] = await db
                .select()
                .from(wordTable)
                .where(and(eq(wordTable.word, value), eq(wordTable.user, user)))
                .limit(1);

            if (wordExisting) {
                if (wordExisting.status === "HIDDEN") {
                    const [wordExistingRecovered] = await db
                        .update(wordTable)
                        .set({ status: "NONE" })
                        .where(
                            and(
                                eq(wordTable.word, wordExisting.word),
                                eq(wordTable.user, user),
                            ),
                        )
                        .returning();

                    if (
                        shouldFetchAIDefinition &&
                        !wordExistingRecovered.aiDefinition
                    ) {
                        updateAIDefinition(opts.ctx, value);
                    }

                    return parseWord(wordExistingRecovered);
                }

                throw new Error("the word is already added");
            }

            const [wordCreated] = await db
                .insert(wordTable)
                .values({
                    word: value,
                    raw: {},
                    status: "NONE",
                    user,
                })
                .returning();

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
            const { userLogin: user } = opts.ctx;
            const { word, isLearned } = opts.input;

            const [wordExisting] = await db
                .select()
                .from(wordTable)
                .where(and(eq(wordTable.word, word), eq(wordTable.user, user)))
                .limit(1);

            if (!wordExisting) {
                throw new Error("the word doesnt exist");
            }

            const [wordUpdated] = await db
                .update(wordTable)
                .set({ status: isLearned ? "LEARNED" : "TO_LEARN" })
                .where(and(eq(wordTable.word, word), eq(wordTable.user, user)))
                .returning();

            return parseWord(wordUpdated);
        }),
    deleteWord: baseProcedure
        .input(
            type({
                word: "string",
            }).assert,
        )
        .mutation(async (opts) => {
            const { userLogin: user } = opts.ctx;
            const { word } = opts.input;

            await db
                .update(wordTable)
                .set({ status: "HIDDEN" })
                .where(and(eq(wordTable.word, word), eq(wordTable.user, user)));
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
        const { userLogin: user } = opts.ctx;

        const wordsList = await db
            .select()
            .from(wordTable)
            .where(
                and(
                    eq(wordTable.user, user),
                    not(eq(wordTable.status, "HIDDEN")),
                ),
            );

        if (!wordsList) {
            throw new Error("unexpected");
        }

        return wordsList.map(parseWord);
    }),
    getWordTrainingStat: baseProcedure
        .input(type({ word: "string" }))
        .query(async (opts) => {
            const { userLogin: user } = opts.ctx;
            const { word } = opts.input;

            const [[totalAttemptsResult], [successfulAttemptsResult]] =
                await Promise.all([
                    db
                        .select({ count: sql<number>`count(*)` })
                        .from(trainingTable)
                        .where(
                            and(
                                eq(trainingTable.word, word),
                                eq(trainingTable.user, user),
                            ),
                        ),
                    db
                        .select({ count: sql<number>`count(*)` })
                        .from(trainingTable)
                        .where(
                            and(
                                eq(trainingTable.word, word),
                                eq(trainingTable.user, user),
                                eq(trainingTable.isSuccess, true),
                            ),
                        ),
                ]);

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
            const { userLogin: user } = opts.ctx;
            const { word, definition, isSuccess } = opts.input;

            const [wordExisting] = await db
                .select()
                .from(wordTable)
                .where(and(eq(wordTable.word, word), eq(wordTable.user, user)))
                .limit(1);

            if (!wordExisting) {
                throw new Error("the word doesnt exist");
            }

            await db.insert(trainingTable).values({
                word,
                definition,
                user,
                isSuccess,
            });
        }),
});

function parseWord(word: object) {
    const wordResult = WordSchema.omit("aiDefinition")(word);
    if (wordResult instanceof type.errors) {
        logger.error("error parsing the word", {
            word,
            summary: wordResult.summary,
        });
        throw new Error("word parse error", { cause: wordResult });
    }

    const aiDefinitionResult = WordSchema.pick("aiDefinition")(word);

    return {
        ...wordResult,
        aiDefinition:
            aiDefinitionResult instanceof type.errors
                ? null
                : aiDefinitionResult.aiDefinition,
    };
}

export type AppRouter = typeof appRouter;
