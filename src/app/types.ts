import { type } from "arktype";

export const DefinitionSchema = type({
    definition: "string",
    partOfSpeech: "string",
    pronunciation: "string?",
    examples: "string[]",
});

export type Definition = typeof DefinitionSchema.infer;

export const StatusSchema = type('"NONE" | "TO_LEARN" | "LEARNED" | "HIDDEN"');

export type Status = typeof StatusSchema.infer;

export const WordSchema = type({
    aiDefinition: DefinitionSchema.array().or("null"),
    aiDefinitionRequestStartDate: "string | null",
    createdAt: "string",
    status: StatusSchema,
    user: "string",
    word: "string",
});

export type Word = typeof WordSchema.infer;
