import { ButtonDelete } from './ButtonDelete';
import { ButtonLearned } from './ButtonLearned';
import { ButtonToLearn } from './ButtonToLearn';
import { SpeakButton } from './SpeakButton';
import { useMutationAIDefinition } from '../hooks/useMutationAIDefinition';
import { ToggleSwitch } from './ToggleSwitch';
import { PronunciationButton } from './PronunciationButton';
import { DBWord } from '../types';

type Props = {
    textSourceCurrent: string;
    setTextSourceCurrent: (text: string) => void;
    textSourceSubmitted: string;
    setTextSourceSubmitted: (text: string) => void;
    isTraining: boolean;
    setIsTraining: (isTraining: boolean) => void;
    wordsAll?: DBWord[];
};

export function WordControls({
    textSourceCurrent,
    setTextSourceCurrent,
    textSourceSubmitted,
    setTextSourceSubmitted,
    isTraining,
    setIsTraining,
    wordsAll,
}: Props) {
    const mutation = useMutationAIDefinition();
    return (
        <form
            className="mt-2 flex flex-wrap items-center gap-3 w-full"
            onSubmit={e => {
                e.preventDefault();
                setTextSourceSubmitted(textSourceCurrent);
            }}
        >
            <div className="flex items-center gap-2 flex-shrink-0">
                <input
                    type="text"
                    value={textSourceCurrent}
                    onChange={e => setTextSourceCurrent(e.target.value)}
                    className="bg-gray-800 text-white border border-gray-500 focus-visible:outline-gray-800"
                />
                <button type="submit" className="bg-gray-300 p-1">
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
                    <button
                        onClick={() => textSourceSubmitted && mutation.mutate(textSourceSubmitted)}
                        className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? 'Generating AI...' : 'AI Definition'}
                    </button>
                </div>
            )}

            <div className="flex-shrink-0">
                <ToggleSwitch
                    checked={isTraining}
                    onChange={setIsTraining}
                    leftLabel="Explore"
                    rightLabel="Train"
                />
            </div>
        </form>
    );
}
