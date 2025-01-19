import { useQuery } from '@tanstack/react-query';
import { WordData } from '../types';
import { useQueryGetWordsAll } from './useQueryGetWordsAll';

export function useQueryGetWord(textSource: string) {
    const { data, isFetching } = useQueryGetWordsAll();

    return useQuery<WordData | undefined>({
        queryKey: ['dictionary', 'en', textSource],
        enabled: textSource !== '',
        queryFn: () => {
            if (!data || isFetching) {
                return new Promise(() => {});
            }

            const foundWord = data.find(word => word.word === textSource);
            if (!foundWord) {
                throw new Error('Word not found');
            }
            return foundWord.raw;
        },
    });
}
