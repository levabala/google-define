import { getUser, createAuthToken, createAuthCookie } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const login = await getUser(req);

        const newToken = await createAuthToken(login);
        const cookie = createAuthCookie(newToken);

        const response = NextResponse.json({ success: true });
        response.headers.set("Set-Cookie", cookie);

        return response;
    } catch (e) {
        console.log(e);
        return NextResponse.json(
            { error: "Failed to refresh token" },
            { status: 401 },
        );
    }
}
