"use client";

// import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
// import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TRPCReactProvider } from "./trpc/client";
// import { getQueryClient } from "./trpc/client";

// const queryClient = getQueryClient();

// const persister =
//     typeof window !== "undefined"
//         ? createSyncStoragePersister({
//               storage: window.localStorage,
//           })
//         : null;

// if (persister) {
//     persistQueryClient({
//         queryClient,
//         persister,
//         maxAge: 30 * 1000,
//         dehydrateOptions: {
//             shouldDehydrateQuery: (query) => {
//                 // Don't persist queries with 'dictionaryAll' key
//                 return !query.queryKey.includes("dictionaryAll");
//             },
//         },
//     });
// }

export function Providers({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <TRPCReactProvider>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </TRPCReactProvider>
    );
}
