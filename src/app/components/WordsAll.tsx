import { DBWord } from '../types';
import { Word } from './Word';

type Props = {
    words: DBWord[] | undefined;
    isLoading: boolean;
    currentWord: string;
    onWordClick: (word: string) => void;
};

export function WordsAll({
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
        'mock',
        'data',
        'state',
        'preview',
        'text',
        'content',
    ];

    return (
        <div>
            <h2 className="text-white mb-2">my words:</h2>
            <div className="flex flex-wrap gap-2 text-white" data-testid="words-all-container">
                {(isLoading || !words ? mockWords : words)
                    .filter(
                        word =>
                            typeof word === 'string' ||
                            word.status !== 'HIDDEN',
                    )
                    .map((wordObj, i) => (
                        <div 
                            key={typeof wordObj === 'string' ? i : wordObj.word}
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
                            />
                        </div>
                    ))}
            </div>
        </div>
    );
}
