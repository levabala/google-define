import { createClient } from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { serialize } from 'cookie';

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const authData = await req.formData();

        const tokenGeneral = authData.get('token');
        const login = authData.get('login');
        const passphrase = authData.get('passphrase');

        if (!tokenGeneral || !login || !passphrase) {
            return NextResponse.json(
                { error: 'Missing token, login or passphrase' },
                { status: 400 },
            );
        }

        const isValid =
            validateToken(tokenGeneral.toString()) &&
            (await validateLogin(login.toString(), passphrase.toString()));

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid creds' },
                { status: 400 },
            );
        }

        const response = NextResponse.redirect(new URL('/', req.url), 303);
        const token = await new SignJWT({ login })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        const cookie = serialize('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        response.headers.set('Set-Cookie', cookie);

        return response;
    } catch (e) {
        console.error(e);
        return NextResponse.redirect(new URL('/login', req.url), 303);
    }
}

function validateToken(token: string) {
    return token === process.env.AUTH_TOKEN;
}

async function validateLogin(login: string, passphrase: string) {
    const supabase = await createClient();

    const { data: user } = await supabase
        .from('user')
        .select()
        .eq('login', login)
        .single();

    if (!user || user.passphrase !== passphrase) {
        return false;
    }

    return true;
}
