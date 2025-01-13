import { DBWord } from '../types';

type WordProps = {
    word: string;
    allWords?: DBWord[];
    onClick: (word: string, addToLearn?: boolean) => void;
    small?: boolean;
    currentWord?: string | null;
};

function getStatusColor(matchedWord: DBWord | undefined): string {
    if (matchedWord?.status === 'LEARNED') return 'text-green-400';
    if (matchedWord?.status === 'TO_LEARN') return 'text-yellow-400';
    return '';
}

export function Word({
    word,
    allWords,
    onClick,
    small,
    currentWord,
}: WordProps) {
    const matchedWord = allWords?.find(
        w => w.word.toLowerCase() === word.toLowerCase(),
    );

    const statusColor = getStatusColor(matchedWord);

    return (
        <span
            onClick={(e) => onClick(word, e.metaKey)}
            className={`cursor-pointer hover:underline ${statusColor} ${small ? 'text-sm' : ''} ${
                matchedWord ? '' : 'text-gray-400'
            } ${currentWord?.toLowerCase() === word.toLowerCase() ? 'underline' : ''}`}
        >
            {word}
        </span>
    );
}
