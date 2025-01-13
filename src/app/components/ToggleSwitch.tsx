type Props = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    leftLabel: string;
    rightLabel: string;
};

export function ToggleSwitch({ checked, onChange, leftLabel, rightLabel }: Props) {
    return (
        <div className="flex items-center gap-3">
            <span className={`text-sm ${!checked ? 'text-white' : 'text-gray-400'}`}>
                {leftLabel}
            </span>
            <button
                onClick={() => onChange(!checked)}
                className={`
                    relative w-14 h-7 rounded-full transition-colors
                    ${checked ? 'bg-blue-500' : 'bg-gray-600'}
                `}
                type="button"
                role="switch"
                aria-checked={checked}
            >
                <span
                    className={`
                        absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform
                        ${checked ? 'translate-x-7' : 'translate-x-0'}
                    `}
                />
            </button>
            <span className={`text-sm ${checked ? 'text-white' : 'text-gray-400'}`}>
                {rightLabel}
            </span>
        </div>
    );
}
