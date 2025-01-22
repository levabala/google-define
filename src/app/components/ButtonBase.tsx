import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

type ButtonBaseProps = {
    isLoading?: boolean;
    disabled?: boolean;
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
    testId?: string;
};

export function ButtonBase({
    isLoading,
    disabled,
    onClick,
    className,
    children,
    testId,
}: ButtonBaseProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || isLoading}
            className={cn(
                'px-4 py-1 rounded inline-flex items-center justify-center gap-2',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
                'disabled:cursor-not-allowed text-white',
                className
            )}
            data-testid={testId}
            aria-disabled={disabled || isLoading}
        >
            {isLoading && <Spinner className="h-4 w-4 shrink-0" />}
            <span className="whitespace-nowrap">{children}</span>
        </button>
    );
}
