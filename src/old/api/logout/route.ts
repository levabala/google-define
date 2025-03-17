import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
    const response = NextResponse.redirect(new URL('/login', req.url), 303);
    
    const cookie = serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0, // Expire immediately
    });

    response.headers.set('Set-Cookie', cookie);
    return response;
}
