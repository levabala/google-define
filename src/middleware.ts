import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from './auth';

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
}

export async function middleware(req: NextRequest) {
    if (process.env.DISABLE_AUTH === '1') {
        return NextResponse.next();
    }

    const token = req.cookies.get('token')?.value;

    if (req.nextUrl.pathname === '/login') {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
        await verifyUser(token);

        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL('/login', req.url));
    }
}

export const config = {
    matcher: ['/((?!api|_next|static|public).*)'],
};
