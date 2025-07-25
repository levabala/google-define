import {
    verifyUser,
    isTokenExpiringSoon,
    createAuthToken,
    createAuthCookie,
} from "./auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    console.log(req.url, req.cookies);
    if (process.env.DISABLE_AUTH === "1") {
        return NextResponse.next();
    }

    const token = req.cookies.get("token")?.value;

    if (req.nextUrl.pathname === "/login") {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
        const payload = await verifyUser(token);

        console.log("check", payload);
        if (isTokenExpiringSoon(payload)) {
            console.log("-------- renew");
            const newToken = await createAuthToken(payload.login);
            const cookie = createAuthCookie(newToken);

            const response = NextResponse.next();
            response.headers.set("Set-Cookie", cookie);
            return response;
        }
        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: [
        "/((?!api|_next|static|public|manifest\.json|sw\.js|.*\.svg|.*\.png|favicon\.ico).*)",
    ],
};
