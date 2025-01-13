import { ButtonDelete } from './ButtonDelete';
import { ButtonLearned } from './ButtonLearned';
import { ButtonToLearn } from './ButtonToLearn';
import { SpeakButton } from './SpeakButton';
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
    return (
        <form
            className="mt-2 flex flex-wrap items-center gap-2"
            onSubmit={e => {
                e.preventDefault();
                setTextSourceSubmitted(textSourceCurrent);
            }}
        >
            <div className="flex items-center gap-2">
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
                <div className="flex items-center gap-2">
                    <SpeakButton text={textSourceSubmitted} />
                    <PronunciationButton word={textSourceSubmitted} />
                    <ButtonToLearn
                        textSourceSubmitted={textSourceSubmitted}
                        wordsAll={wordsAll}
                    />
                    <ButtonLearned
                        textSourceSubmitted={textSourceSubmitted}
                        wordsAll={wordsAll}
                    />
                    <ButtonDelete
                        textSourceSubmitted={textSourceSubmitted}
                        wordsAll={wordsAll}
                        setTextSourceCurrent={setTextSourceCurrent}
                        setTextSourceSubmitted={setTextSourceSubmitted}
                    />
                </div>
            )}

            <div className="ml-auto">
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
