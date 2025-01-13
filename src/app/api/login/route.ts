import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const authData = await req.formData();

        const token = authData.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Missing token' },
                { status: 400 },
            );
        }

        const response = NextResponse.redirect(new URL('/', req.url));
        response.cookies.set('authToken', token.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // Token validity: 1 week
        });

        return response;
    } catch (e) {
        console.error(e);
        return NextResponse.redirect(new URL('/login', req.url));
    }
}
