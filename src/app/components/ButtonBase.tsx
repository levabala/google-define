import React from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

type ButtonBaseProps = React.ComponentPropsWithoutRef<'button'> & {
    isLoading?: boolean;
    className?: string;
    testId?: string;
};

export const ButtonBase = React.forwardRef<HTMLButtonElement, ButtonBaseProps>(function ButtonBase({
    isLoading,
    className,
    children,
    testId,
    disabled,
    ...props
}, ref) {
    return (
        <button
            {...props}
            type={props.type || 'button'}
            disabled={disabled || isLoading}
            className={cn(
                'px-4 py-1 rounded relative inline-flex items-center justify-center gap-2',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
                'disabled:cursor-not-allowed text-white',
                className
            )}
            ref={ref}
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
});
