import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/db';
import { WordData } from '@/app/types';

export async function POST(req: NextRequest): Promise<NextResponse> {
    const { word, status } = await req.json();

    if (!word || !['TO_LEARN', 'LEARNED'].includes(status)) {
        return NextResponse.json(
            { error: 'Invalid word or status' },
            { status: 400 },
        );
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('word')
        .update({ status })
        .eq('word', word);

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

    const { error } = await supabase
        .from('word')
        .update({ status: 'HIDDEN' })
        .eq('word', word);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const word = searchParams.get('word');

    if (!word) {
        return NextResponse.json(
            { error: `Error: the word is invalid` },
            { status: 400 },
        );
    }

    try {
        const supabase = await createClient();

        const { data: wordDataDB } = await supabase
            .from('word')
            .select()
            .eq('word', word);

        const wordDataCached = wordDataDB?.[0];

        if (wordDataCached) {
            return NextResponse.json(JSON.parse(wordDataCached.raw), {
                status: 200,
            });
        }

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

        console.log('result', data);
        if (data) {
            console.log('async write to supabase');

            supabase
                .from('word')
                .insert({ word: data.word, raw: JSON.stringify(data) })
                .then(res => {
                    console.log('inserted', res);
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
