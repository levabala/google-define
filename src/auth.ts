import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function verifyUser(jwt: string) {
    const { payload } = await jwtVerify(jwt, JWT_SECRET);

    if (!('login' in payload) || typeof payload.login !== 'string') {
        throw new Error('Invalid JWT');
    }

    return payload as { login: string };
}

export async function getUser(req: NextRequest) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
        throw new Error('No token found');
    }

    return (await verifyUser(token)).login;
}
