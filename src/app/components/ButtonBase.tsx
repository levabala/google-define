import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

type ButtonBaseProps = {
    isLoading?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
    children: React.ReactNode;
    testId?: string;
    type?: 'button' | 'submit' | 'reset';
};

export function ButtonBase({
    isLoading,
    disabled,
    onClick,
    className,
    children,
    testId,
    type,
}: ButtonBaseProps) {
    return (
        <button
            type={type || 'button'}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={cn(
                'px-4 py-1 rounded relative inline-flex items-center justify-center gap-2',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
                'disabled:cursor-not-allowed text-white',
                className
            )}
            data-testid={testId}
            aria-disabled={disabled || isLoading}
        >
            <span className={cn('whitespace-nowrap', isLoading && 'invisible')}>{children}</span>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner className="h-4 w-4" />
                </div>
            )}
        </button>
    );
}
