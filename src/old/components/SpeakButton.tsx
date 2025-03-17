import { cn } from '@/utils/cn';

type Props = {
    text: string;
    className?: string;
};

export function SpeakButton({ text, className }: Props) {
    const speak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    return (
        <button
            onClick={speak}
            className={cn(
                'bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors',
                className,
            )}
            title="Speak word"
            type="button"
            data-testid="speak-button"
        >
            🔊
        </button>
    );
}
