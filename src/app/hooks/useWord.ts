import { useQueryGetWordsAll } from './useQueryGetWordsAll';
import { WordData, DBWord } from '../types';

export function useWord(textSource: string): WordData | undefined {
    const { data } = useQueryGetWordsAll();
    
    if (!textSource || !data) {
        return undefined;
    }

    return data.find((word: DBWord) => word.word === textSource)?.raw;
}
