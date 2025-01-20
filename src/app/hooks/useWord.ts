import { useQueryGetWordsAll } from './useQueryGetWordsAll';
import { WordData } from '../types';
import { z } from 'zod';
import { DBWordSchema } from '../schemas';

export function useWord(textSource: string): WordData | undefined {
    const { data } = useQueryGetWordsAll();
    
    if (!textSource || !data) {
        return undefined;
    }

    return data.find((word: z.infer<typeof DBWordSchema>) => word.word === textSource)?.raw;
}
