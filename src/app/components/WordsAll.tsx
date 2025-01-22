import { DBWord } from '../types';
import { Word } from './Word';

type Props = {
    mode: 'explore' | 'definition' | 'spelling';
    words: DBWord[] | undefined;
    isLoading: boolean;
    currentWord: string;
    onWordClick: (word: string) => void;
};

export function WordsAll({
    mode,
    words,
    isLoading,
    currentWord,
    onWordClick,
}: Props) {
    // Mock data for loading state with realistic word lengths
    const mockWords = [
        'example',
        'test',
        'loading',
        'placeholder',
        'word',
        'sample',
        'mock',
        'data',
        'state',
        'preview',
        'text',
        'content',
        'example2',
        'test2',
        'loading2',
        'placeholder2',
        'word2',
        'sample2',
        'mock2',
        'data2',
        'state2',
        'preview2',
        'text2',
        'content2',
    ];

    return (
        <div data-testid="words-all">
            <h2 className="text-white mb-2">my words:</h2>
            <div className="flex flex-wrap gap-2 text-white" data-testid="words-all-container">
                {(isLoading || !words ? mockWords : words)
                    .filter(
                        word =>
                            typeof word === 'string' ||
                            word.status !== 'HIDDEN',
                    )
                    .sort((a, b) => {
                        // Sort by status priority: NONE -> TO_LEARN -> LEARNED
                        const statusOrder = { 
                            NONE: 0, 
                            TO_LEARN: 1, 
                            LEARNED: 2 
                        };
                        
                        const wordA = typeof a === 'string' ? { word: a, status: 'NONE' } : { ...a, status: a.status || 'NONE' };
                        const wordB = typeof b === 'string' ? { word: b, status: 'NONE' } : { ...b, status: b.status || 'NONE' };
                        
                        const statusA = statusOrder[wordA.status as keyof typeof statusOrder];
                        const statusB = statusOrder[wordB.status as keyof typeof statusOrder];
                        
                        if (statusA !== statusB) return statusA - statusB;
                        return wordA.word.localeCompare(wordB.word);
                    })
                    .map((wordObj, i) => (
                        <div 
                            key={typeof wordObj === 'string' ? wordObj : wordObj.word}
                            role="listitem" 
                            data-testid={`word-list-item-${typeof wordObj === 'string' ? wordObj : wordObj.word}`}
                        >
                            <Word
                                key={typeof wordObj === 'string' ? i : wordObj.word}
                                word={
                                    typeof wordObj === 'string'
                                        ? wordObj
                                        : wordObj.word
                                }
                                allWords={words}
                                currentWord={currentWord}
                                small
                                onClick={onWordClick}
                                isLoading={isLoading || !words}
                                displayMode={mode === 'spelling' ? 'obscured' : 'normal'}
                            />
                        </div>
                    ))}
            </div>
        </div>
    );
}
