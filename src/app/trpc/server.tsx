import "server-only";

import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";
import { createTRPCContext } from "./init";
import { cache } from "react";

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
    // @ts-expect-error -- i dunno
    ctx: createTRPCContext,
    router: appRouter,
    queryClient: getQueryClient,
});
