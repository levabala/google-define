import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/db';
import { getUser } from '@/auth';
import { WordData } from '@/app/types';
import { ai } from '@/ai';

export async function POST(req: NextRequest): Promise<NextResponse> {
    const { word } = await req.json();

    if (!word) {
        return NextResponse.json(
            { error: `Error: the word is invalid` },
            { status: 400 },
        );
    }

    try {
        const res = await ai({
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
            ],
            model: 'deepseek-chat',
        });
        console.log({ res });

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

        if (!data) {
            throw new Error('no such word in the dictionary');
        }

        const supabase = await createClient();
        const user = await getUser(req);

        const dbrecord = await supabase.from('word').insert({
            word: data.word,
            raw: JSON.stringify(data),
            status: 'NONE',
            user,
        });

        return NextResponse.json(dbrecord, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message || 'Unknown error occurred' },
            { status: 500 },
        );
    }
}
