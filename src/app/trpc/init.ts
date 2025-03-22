import { NextRequest } from "next/server";
import { initTRPC } from "@trpc/server";
import { cookies } from "next/headers";
import superjson from "superjson";
import { getUser } from "@/auth";
import { cache } from "react";

export const createTRPCContext = cache(async () => {
    const cook = await cookies();

    const userLogin = await getUser({
        cookies: cook,
    } as unknown as NextRequest);

    return {
        userLogin,
    };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
    transformer: superjson,
});

const logger = t.middleware(async ({ path, type, next, ctx }) => {
    const start = Date.now();
    console.log(`[${type}] ${path} hit`); // Log just the path and type

    const result = await next({
        ctx,
    });

    const durationMs = Date.now() - start;
    console.log(`[${type}] ${path} done ${durationMs}ms`); // Log just the path and type
    return result;
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(logger);
