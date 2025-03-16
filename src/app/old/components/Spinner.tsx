import { cn } from '../../../utils/cn';

export function Spinner({ className }: { className?: string }) {
    return (
        <div 
            className={cn(
                'animate-spin rounded-full h-4 w-4 border border-current border-t-transparent',
                className
            )}
            data-testid="spinner"
            role="status"
            aria-label="loading"
        />
    );
}
