import { type } from "arktype";

export const DefinitionSchema = type({
    definition: "string",
    partOfSpeech: "string",
    examples: "string[]",
});

export type Definition = typeof DefinitionSchema.infer;

export const StatusSchema = type('"NONE" | "TO_LEARN" | "LEARNED" | "HIDDEN"');

export type Status = typeof StatusSchema.infer;

export const WordSchema = type({
    ai_definition: DefinitionSchema.array().or("null"),
    ai_definition_request_start_date: "string | null",
    created_at: "string",
    status: StatusSchema,
    user: "string",
    word: "string",
});

export type Word = typeof WordSchema.infer;
