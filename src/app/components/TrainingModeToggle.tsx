import { cn } from '../../utils/cn';

type TrainingModeToggleProps = {
    trainingMode: 'definition' | 'spelling';
    setTrainingMode: (mode: 'definition' | 'spelling') => void;
};

export function TrainingModeToggle({
    trainingMode,
    setTrainingMode,
}: TrainingModeToggleProps) {
    return (
        <div className="flex gap-2 mb-4">
            <button
                onClick={() => setTrainingMode('definition')}
                className={cn(
                    'px-4 py-1 rounded',
                    trainingMode === 'definition' ? 'bg-blue-600' : 'bg-gray-600'
                )}
            >
                Definition Training
            </button>
            <button
                onClick={() => setTrainingMode('spelling')}
                className={cn(
                    'px-4 py-1 rounded',
                    trainingMode === 'spelling' ? 'bg-blue-600' : 'bg-gray-600'
                )}
            >
                Spelling Training
            </button>
        </div>
    );
}
