'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { queryClient } from '../queryClientent';

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
