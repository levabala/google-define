import { useMutationPronunciation } from '../hooks/useMutationPronunciation';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { toast } from 'react-toastify';

type Props = {
    word: string;
    className?: string;
};

type RecordingStatus = 'idle' | 'recording' | 'success' | 'error';

export function PronunciationButton({ word, className }: Props) {
    const pronunciationMutation = useMutationPronunciation();
    const [status, setStatus] = useState<RecordingStatus>('idle');

    const handleRecording = async () => {
        if (status === 'recording') return;
        setStatus('recording');
        try {
            const recognition = new (window.webkitSpeechRecognition ||
                window.SpeechRecognition)();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            // Set a 5 second timeout
            const timeout = setTimeout(() => {
                recognition.stop();
                toast.error('Recording timed out after 5 seconds 🎤⌛');
                setStatus('error');
                setTimeout(() => setStatus('idle'), 2000);
            }, 5000);

            recognition.start();

            recognition.onresult = async event => {
                clearTimeout(timeout);
                const transcript = event.results[0][0].transcript
                    .toLowerCase()
                    .trim();
                const success = transcript === word.toLowerCase();

                await pronunciationMutation.mutateAsync({
                    word,
                    recognised_text: transcript,
                    success,
                });

                if (success) {
                    toast.success('Hit! 🎤✨');
                } else {
                    toast.error(`Meh. You said: "${transcript}" 🎤❌`);
                }

                setStatus(success ? 'success' : 'error');
                setTimeout(() => setStatus('idle'), 2000);
            };

            recognition.onend = () => {
                clearTimeout(timeout);
            };

            recognition.onerror = event => {
                clearTimeout(timeout);
                console.error('Speech recognition error:', event.error);
                toast.error(
                    'Failed to recognize speech. Please try again 🎤❌',
                );
                setStatus('error');
                setTimeout(() => setStatus('idle'), 2000);
            };
        } catch (error) {
            console.error('Speech recognition not supported:', error);
            toast.error(
                'Speech recognition is not supported in your browser 🎤❌',
            );
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    return (
        <button
            type="button"
            className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                className,
                status === 'idle' && 'bg-gray-200 hover:bg-gray-300',
                status === 'recording' && 'bg-red-500 animate-pulse',
                status === 'success' && 'bg-green-500',
                status === 'error' && 'bg-red-500',
            )}
            onClick={handleRecording}
            disabled={status === 'recording'}
            title={
                status === 'idle'
                    ? 'Record pronunciation'
                    : status === 'recording'
                      ? 'Recording...'
                      : status === 'success'
                        ? 'Correct pronunciation!'
                        : 'Incorrect pronunciation'
            }
        >
            {status === 'idle' && <span className="text-gray-700">🎤</span>}
            {status === 'recording' && <span className="text-white">🎤</span>}
            {status === 'success' && <span className="text-white">✓</span>}
            {status === 'error' && <span className="text-white">✕</span>}
        </button>
    );
}
