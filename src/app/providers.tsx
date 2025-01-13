'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 1000 * 60, // 1 minute
        },
    },
});

const persister =
    typeof window !== 'undefined'
        ? createSyncStoragePersister({
              storage: window.localStorage,
          })
        : null;

if (persister) {
    persistQueryClient({
        queryClient,
        persister,
        maxAge: Infinity,
        dehydrateOptions: {
            shouldDehydrateQuery: query => {
                // Don't persist queries with 'dictionaryAll' key
                return !query.queryKey.includes('dictionaryAll');
            },
        },
    });
}

export function Providers({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
