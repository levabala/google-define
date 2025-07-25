import { NextRequest, NextResponse } from "next/server";
import { createLogoutCookie } from "@/auth";

export async function POST(req: NextRequest) {
    const response = NextResponse.redirect(new URL("/login", req.url), 303);
    const cookie = createLogoutCookie();

    response.headers.set("Set-Cookie", cookie);
    return response;
}
