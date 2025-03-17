import { useQueryGetWordsAll } from './useQueryGetWordsAll';
import { DBWord } from '../types';

export function useWord(textSource: string) {
    const { data } = useQueryGetWordsAll();
    
    if (!textSource || !data) {
        return undefined;
    }

    return data.find((word: DBWord) => word.word === textSource);
}
