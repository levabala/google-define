import { RadioButton } from './RadioButton';

type TrainingModeToggleProps = {
    mode: 'explore' | 'definition' | 'spelling';
    setMode: (mode: 'explore' | 'definition' | 'spelling') => void;
};

export function TrainingModeToggle({
    mode,
    setMode,
}: TrainingModeToggleProps) {
    return (
        <div className="flex gap-2 mb-4">
            <RadioButton
                value="explore"
                checked={mode === 'explore'}
                onChange={setMode}
                label="Explore"
            />
            <RadioButton
                value="definition"
                checked={mode === 'definition'}
                onChange={setMode}
                label="Train Definitions"
            />
            <RadioButton
                value="spelling"
                checked={mode === 'spelling'}
                onChange={setMode}
                label="Train Spelling"
            />
        </div>
    );
}
