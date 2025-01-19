import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/db';
import { WordData, WordStatus } from '@/app/types';
import { getUser } from '@/auth';

export async function PUT(req: NextRequest): Promise<NextResponse> {
    const { word, status } = await req.json();

    if (!word || !['TO_LEARN', 'LEARNED'].includes(status)) {
        return NextResponse.json(
            { error: 'Invalid word or status' },
            { status: 400 },
        );
    }

    const supabase = await createClient();

    const user = await getUser(req);
    const { error } = await supabase
        .from('word')
        .update({ status })
        .eq('word', word)
        .eq('user', user);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const word = searchParams.get('word');

    if (!word) {
        return NextResponse.json({ error: 'Invalid word' }, { status: 400 });
    }

    const supabase = await createClient();

    const user = await getUser(req);
    const { error } = await supabase
        .from('word')
        .update({ status: 'HIDDEN' })
        .eq('word', word)
        .eq('user', user);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    const { word, initialStatus } = await req.json();

    if (!word) {
        return NextResponse.json(
            { error: `Error: the word is invalid` },
            { status: 400 },
        );
    }

    try {
        console.warn('------------- wordsapi is hit');
        const response = await fetch(
            `https://wordsapiv1.p.rapidapi.com/words/${word}`,
            {
                method: 'GET',
                headers: {
                    'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
                    'x-rapidapi-key': process.env.RAPID_WORDSAPI_KEY as string,
                },
            },
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: `Error fetching word data: ${response.statusText}` },
                { status: response.status },
            );
        }

        const data = (await response.json()) as WordData;

        if (data) {
            const supabase = await createClient();
            const user = await getUser(req);
            
            await supabase.from('word').insert({
                word: data.word,
                raw: JSON.stringify(data),
                status: initialStatus || 'NONE',
                user,
            });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message || 'Unknown error occurred' },
            { status: 500 },
        );
    }
}
