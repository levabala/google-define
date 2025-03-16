type Props = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
};

export function Checkbox({ checked, onChange, label }: Props) {
    return (
        <label className="inline-flex items-center cursor-pointer gap-2 select-none">
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    data-testid="checkbox-input"
                />
                <div className="w-4 h-4 border border-gray-500 peer-checked:bg-blue-500 peer-checked:border-blue-500 rounded transition-colors">
                    {checked && (
                        <svg
                            className="w-3 h-3 text-white absolute left-0.5 top-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    )}
                </div>
            </div>
            <span className="text-white text-sm">{label}</span>
        </label>
    );
}
