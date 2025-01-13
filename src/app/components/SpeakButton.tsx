type Props = {
    text: string;
};

export function SpeakButton({ text }: Props) {
    const speak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    return (
        <button
            onClick={speak}
            className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
            title="Speak word"
            type="button"
        >
            🔊
        </button>
    );
}
