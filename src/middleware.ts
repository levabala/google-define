import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
    const authToken = req.cookies.get('authToken');

    const isValid = authToken && validateToken(authToken);

    if (!isValid) {
        if (req.nextUrl.pathname === '/login') {
            return NextResponse.next();
        }

        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

function validateToken(token: RequestCookie) {
    return token.value === process.env.AUTH_TOKEN;
}

export const config = {
    matcher: ['/((?!api|_next|static|public).*)'],
};
