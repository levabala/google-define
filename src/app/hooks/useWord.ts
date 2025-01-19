import { useQueryGetWordsAll } from './useQueryGetWordsAll';
import { WordData } from '../types';

export function useWord(textSource: string): WordData | undefined {
    const { data } = useQueryGetWordsAll();
    
    if (!textSource || !data) {
        return undefined;
    }

    return data.find(word => word.word === textSource)?.raw;
}
