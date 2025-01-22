import { useState } from 'react';
import { ButtonBase } from './ButtonBase';
import { Spinner } from './Spinner';
import { DBWord } from '../types';

type SpellingTrainProps = {
    word: DBWord;
    definition: string;
    onSuccess: () => void;
    onFailure: (errors: number) => void;
    onNext: () => void;
};

export function SpellingTrain({
    word,
    definition,
    onSuccess,
    onFailure,
    onNext,
}: SpellingTrainProps) {
    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/training/spelling', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    word: word.word, 
                    answer 
                }),
            });
            
            const result = await response.json();
            
            if (result.success) {
                onSuccess();
            } else {
                onFailure(result.errors);
            }
            
            setSubmitted(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="text-lg font-semibold">
                {definition}
            </div>
            
            <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="p-2 border rounded bg-gray-800 text-white"
                placeholder="Type the word..."
                disabled={submitted || isLoading}
            />
            
            {!submitted ? (
                <ButtonBase
                    onClick={handleSubmit}
                    disabled={isLoading || !answer.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {isLoading ? <Spinner className="h-5 w-5" /> : 'Submit'}
                </ButtonBase>
            ) : (
                <ButtonBase
                    onClick={onNext}
                    className="bg-green-600 hover:bg-green-700"
                >
                    Next Word
                </ButtonBase>
            )}
        </div>
    );
}
