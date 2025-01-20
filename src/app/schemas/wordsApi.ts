import { z } from 'zod';

const DefinitionSchema = z.object({
    definition: z.string(),
    partOfSpeech: z.string(),
    synonyms: z.array(z.string()).optional(),
    antonyms: z.array(z.string()).optional(),
    examples: z.array(z.string()).optional(),
});

const PronunciationSchema = z.object({
    all: z.string().optional(),
    noun: z.string().optional(),
    verb: z.string().optional(),
});

const SyllablesSchema = z.object({
    count: z.number(),
    list: z.array(z.string()),
});

export const WordsApiResponseSchema = z.object({
    word: z.string(),
    results: z.array(DefinitionSchema),
    pronunciation: PronunciationSchema.optional(),
    frequency: z.number().optional(),
    syllables: SyllablesSchema.optional(),
});
