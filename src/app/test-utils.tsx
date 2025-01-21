import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    
    const WrapperComponent = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <NuqsAdapter>
                <div role="main">
                    {children}
                </div>
            </NuqsAdapter>
        </QueryClientProvider>
    );
    WrapperComponent.displayName = 'TestWrapper';
    return WrapperComponent;
};
