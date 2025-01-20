import { z } from 'zod';
import {
    WordDataSchema,
    WordStatusSchema,
    DBWordSchema,
    WordStatsSchema,
    DBPronounciationSchema,
    TrainingGuessSchema,
} from './schemas';

export type WordData = z.infer<typeof WordDataSchema>;
export type WordStatus = z.infer<typeof WordStatusSchema>;
export type DBWord = z.infer<typeof DBWordSchema>;
export type WordStats = z.infer<typeof WordStatsSchema>;
export type DBPronounciation = z.infer<typeof DBPronounciationSchema>;
export type DBPronounciationInput = Omit<DBPronounciation, 'created_at'>;
export type TrainingGuess = z.infer<typeof TrainingGuessSchema>;
