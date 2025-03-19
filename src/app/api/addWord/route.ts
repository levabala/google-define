import { NextRequest, NextResponse } from "next/server";
import { appRouter } from "@/app/trpc/routers/_app";
import { createTRPCContext } from "@/app/trpc/init";

export async function GET(req: NextRequest): Promise<NextResponse> {
    const word = req.nextUrl.searchParams.get("word");

    if (!word) {
        return NextResponse.json({ error: "Missing word" }, { status: 400 });
    }

    try {
        const ctx = await createTRPCContext();
        const router = appRouter.createCaller(ctx);

        await router.addWord({ value: word });
    } catch (e) {
        console.log(e);
    }

    const url = new URL(`/?word=${word}&invalidate=1`, req.url);

    if (req.nextUrl.searchParams.get("exit") === "1") {
        url.searchParams.set("exit", "1");
    }

    return NextResponse.redirect(url, 303);
}
