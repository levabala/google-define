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

            return data.find(word => word.word === textSource)?.raw;
        },
    });
}
