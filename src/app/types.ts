import { type } from "arktype";

export const DefinitionSchema = type({
    definition: "string",
    partOfSpeech: "string",
    examples: "string[]",
});

export type Definition = typeof DefinitionSchema.infer;

