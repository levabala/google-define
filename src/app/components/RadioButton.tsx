import { cn } from '../../utils/cn';

type RadioButtonProps<T extends string> = {
    value: T;
    checked: boolean;
    onChange: (value: T) => void;
    label: string;
    className?: string;
};

export function RadioButton<T extends string>({ value, checked, onChange, label, className }: RadioButtonProps<T>) {
    return (
        <label className={cn(
            'px-4 py-1 rounded cursor-pointer transition-colors',
            checked ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-700',
            className
        )}>
            <input
                type="radio"
                value={value}
                checked={checked}
                onChange={() => onChange(value)}
                className="hidden"
            />
            {label}
        </label>
    );
}
