import { ButtonDelete } from './ButtonDelete';
import { ButtonLearned } from './ButtonLearned';
import { ButtonToLearn } from './ButtonToLearn';
import { SpeakButton } from './SpeakButton';
import { ButtonAI } from './ButtonAI';
import { PronunciationButton } from './PronunciationButton';
import { DBWord } from '../types';

type Props = {
    mode: 'explore' | 'definition' | 'spelling';
    textSourceCurrent: string;
    setTextSourceCurrent: (text: string) => void;
    textSourceSubmitted: string;
    setTextSourceSubmitted: (text: string) => void;
    wordsAll?: DBWord[];
};

export function WordControls({
    mode,
    textSourceCurrent,
    setTextSourceCurrent,
    textSourceSubmitted,
    setTextSourceSubmitted,
    wordsAll,
}: Props) {
    return (
        <form
            className="mt-2 flex flex-wrap items-center gap-3 w-full"
            onSubmit={e => {
                e.preventDefault();
                setTextSourceSubmitted(textSourceCurrent);
            }}
            data-testid="word-controls"
        >
            <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        value={textSourceCurrent}
                        onChange={e => setTextSourceCurrent(e.target.value)}
                        className="bg-gray-800 text-white border border-gray-500 focus-visible:outline-gray-800"
                        data-testid="word-input"
                    />
                    {mode === 'spelling' && (
                        <div className="absolute inset-0 pointer-events-none bg-gray-800 flex items-center px-2">
                            {'•'.repeat(textSourceCurrent.length)}
                        </div>
                    )}
                </div>
                <button 
                    type="submit" 
                    className="bg-gray-300 p-1"
                    data-testid="search-button"
                >
                    Search
                </button>
            </div>

            {textSourceSubmitted && (
                <div className="flex flex-wrap items-center gap-2 whitespace-nowrap">
                    <SpeakButton text={textSourceSubmitted} className="flex-shrink-0" />
                    <PronunciationButton word={textSourceSubmitted} className="flex-shrink-0" />
                    <ButtonToLearn
                        textSourceSubmitted={textSourceSubmitted}
                        wordsAll={wordsAll}
                        className="flex-shrink-0"
                    />
                    <ButtonLearned
                        textSourceSubmitted={textSourceSubmitted}
                        wordsAll={wordsAll}
                        className="flex-shrink-0"
                    />
                    <ButtonDelete
                        textSourceSubmitted={textSourceSubmitted}
                        wordsAll={wordsAll}
                        setTextSourceCurrent={setTextSourceCurrent}
                        setTextSourceSubmitted={setTextSourceSubmitted}
                        className="flex-shrink-0"
                    />
                    <ButtonAI
                        textSourceSubmitted={textSourceSubmitted}
                        wordsAll={wordsAll}
                        className="flex-shrink-0"
                    />
                </div>
            )}

        </form>
    );
}
