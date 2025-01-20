import { z } from 'zod';

export const WordResultSchema = z.object({
    definition: z.string(),
    partOfSpeech: z.string().nullable(),
    synonyms: z.array(z.string()).optional(),
    instanceOf: z.array(z.string()).optional(),
    hasInstances: z.array(z.string()).optional(),
    typeOf: z.array(z.string()).optional(),
    hasTypes: z.array(z.string()).optional(),
    examples: z.array(z.string()).optional(),
    hasCategories: z.array(z.string()).optional(),
    hasParts: z.array(z.string()).optional(),
    derivation: z.array(z.string()).optional(),
    partOf: z.array(z.string()).optional(),
});

export const WordDataSchema = z.object({
    word: z.string(),
    results: z.array(WordResultSchema).optional(),
    syllables: z.object({
        count: z.number(),
        list: z.array(z.string()),
    }),
    pronunciation: z.object({
        all: z.string(),
    }),
    frequency: z.number(),
});

export const WordStatusSchema = z.enum(['NONE', 'TO_LEARN', 'LEARNED', 'HIDDEN']);

export const DBWordSchema = z.object({
    word: z.string(),
    raw: WordDataSchema,
    status: WordStatusSchema,
    created_at: z.string(),
});

export const WordStatsSchema = z.object({
    total: z.number(),
    successful: z.number(),
    failed: z.number(),
    ratio: z.number(),
});

export const DBPronounciationSchema = z.object({
    word: z.string(),
    recognised_text: z.string(),
    created_at: z.string(),
    success: z.boolean(),
});

export const TrainingGuessParamsSchema = z.object({
    word: z.string(),
    success: z.boolean(),
    definition: z.string(),
});

export const PronunciationDataSchema = z.object({
    word: z.string(),
    recognised_text: z.string(),
    success: z.boolean(),
});

export const MarkWordStatusSchema = z.enum(['TO_LEARN', 'LEARNED', 'HIDDEN']);
