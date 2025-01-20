import { z } from 'zod';

// Word Definitions
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

// API Response Schemas
export const WordsApiResponseSchema = z.object({
    word: z.string(),
    results: z.array(DefinitionSchema),
    pronunciation: PronunciationSchema.optional(),
    frequency: z.number().optional(),
    syllables: SyllablesSchema.optional(),
});

// Database Schemas
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
    syllables: z
        .object({
            count: z.number(),
            list: z.array(z.string()),
        })
        .optional(),
    pronunciation: z
        .string()
        .or(
            z.object({
                all: z.string(),
            }),
        )
        .optional(),
    frequency: z.number().optional(),
});

export const WordStatusSchema = z.enum([
    'NONE',
    'TO_LEARN',
    'LEARNED',
    'HIDDEN',
]);
export const MarkWordStatusSchema = z.enum(['TO_LEARN', 'LEARNED', 'HIDDEN']);

export const DBWordSchema = z.object({
    word: z.string(),
    raw: WordDataSchema,
    status: WordStatusSchema,
    created_at: z.string(),
});

export const DBPronounciationSchema = z.object({
    word: z.string(),
    recognised_text: z.string(),
    success: z.boolean(),
    created_at: z.string().optional(),
});

// Training Schemas
export const TrainingGuessSchema = z.object({
    word: z.string(),
    success: z.boolean(),
    definition: z.string(),
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

// Stats Schemas
export const WordStatsSchema = z.object({
    total: z.number(),
    successful: z.number(),
    failed: z.number(),
    ratio: z.number(),
});

export const AIDefinitionSchema = z.object({
    definition: z.string(),
    partOfSpeech: z.string().optional(),
    examples: z.array(z.string()).optional(),
});

export const WordsAllResponseSchema = z.array(DBWordSchema);
export const SuccessResponseSchema = z.object({ success: z.boolean() });
export const ErrorResponseSchema = z.object({ error: z.string() });

// Recent Attempts Schemas
export const RecentGuessesSchema = z.array(z.boolean());
export const RecentPronunciationsSchema = z.array(z.boolean());
