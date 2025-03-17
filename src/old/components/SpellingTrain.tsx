import React, { useState } from 'react';
import { useMutationSpelling } from '../../hooks/useMutationSpellinging';
import { cn } from '../../../utils/cn';
import { ButtonBase } from './ButtonBase';
import { Spinner } from './Spinner';
import { DBWord } from '../types';
import { Definition } from './Definition';

type SpellingTrainProps = {
    word: DBWord;
    definition: string;
    wordsAll?: DBWord[];
    onSuccess: () => void;
    onFailure: (errors: number) => void;
    onNext: () => void;
};

export function SpellingTrain({
    word,
    definition,
    wordsAll,
    onSuccess,
    onFailure,
    onNext,
}: SpellingTrainProps) {
    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

    const spellingMutation = useMutationSpelling();

    const nextButtonRef = React.useRef<HTMLButtonElement>(null);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const result = await spellingMutation.mutateAsync({
                word: word.word,
                answer
            });
            
            if (result.success) {
                onSuccess();
                setLastCorrect(true);
            } else {
                onFailure(result.errors);
                setLastCorrect(false);
            }
            
            setSubmitted(true);
            // Focus on the Next button after submission
            nextButtonRef.current?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <Definition
                result={{
                    definition: word.ai_definition?.definition || definition,
                    partOfSpeech: word.ai_definition?.partOfSpeech || word.raw.results?.[0]?.partOfSpeech || null,
                    examples: word.ai_definition?.examples || word.raw.results?.[0]?.examples || [],
                    source: word.ai_definition ? 'ai' : 'dictionary'
                }}
                wordsAll={wordsAll || []}
                textSourceSubmitted={word.word}
                onWordClick={(word) => {
                    // Handle word clicks within the definition
                    setAnswer(word);
                }}
                hideExamples
            />
            
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!submitted && answer.trim()) {
                        handleSubmit();
                    }
                }}
                className="flex flex-col gap-4"
            >
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
                        type="submit"
                        disabled={isLoading || !answer.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? <Spinner className="h-5 w-5" /> : 'Submit'}
                    </ButtonBase>
                ) : (
                // TODO: focus on the Next button after submission
                <ButtonBase
                    ref={nextButtonRef}
                    onClick={() => {
                        setAnswer('');
                        setSubmitted(false);
                        setLastCorrect(null);
                        onNext();
                    }}
                    className={cn(
                        lastCorrect === true && 'bg-green-600 hover:bg-green-700',
                        lastCorrect === false && 'bg-red-600 hover:bg-red-700',
                        lastCorrect === null && 'bg-gray-600 hover:bg-gray-700'
                    )}
                >
                    Next Word
                    </ButtonBase>
                )}
            </form>
        </div>
    );
}
