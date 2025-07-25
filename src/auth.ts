import { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { serialize } from "cookie";

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const TOKEN_DURATION_DAYS = 30;

export async function verifyUser(jwt: string) {
    const { payload } = await jwtVerify(jwt, JWT_SECRET);

    if (!("login" in payload) || typeof payload.login !== "string") {
        throw new Error("Invalid JWT");
    }

    return payload as { login: string; exp?: number };
}

export function isTokenExpiringSoon(payload: { exp?: number }): boolean {
    if (!payload.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - now;
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;

    return timeUntilExpiry < sevenDaysInSeconds;
}

export async function getUser(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
        throw new Error("No token found");
    }

    return (await verifyUser(token)).login;
}

export async function createAuthToken(login: string): Promise<string> {
    return await new SignJWT({ login })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(`${TOKEN_DURATION_DAYS}d`)
        .sign(JWT_SECRET);
}

export function createAuthCookie(token: string): string {
    return serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * TOKEN_DURATION_DAYS,
    });
}

export function createLogoutCookie(): string {
    return serialize("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    });
}
