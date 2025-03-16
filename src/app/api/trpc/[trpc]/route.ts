import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../trpc/routers/_app";
import { createTRPCContext } from "../../../trpc/init";

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext: createTRPCContext,
        onError: ({ error, path }) => {
            console.error({ path, error })
        },
    });

export { handler as GET, handler as POST };
