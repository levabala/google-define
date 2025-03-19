import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "./trpc/server";
import { Suspense } from "react";

import Main from "./main";

export default async function MainWrapper() {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery(trpc.getWordsAll.queryOptions());

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback="loading">
                <Main />
            </Suspense>
        </HydrationBoundary>
    );
}
