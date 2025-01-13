import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/db';
import { WordStats } from '@/app/types';

export async function GET(req: NextRequest) {
    const word = req.nextUrl.searchParams.get('word');

    if (!word) {
        return NextResponse.json(
            { error: 'Word parameter is required' },
            { status: 400 },
        );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('training')
        .select('is_success')
        .eq('word', word);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = data.length;
    const successful = data.filter(row => row.is_success).length;
    const failed = total - successful;
    const ratio = total > 0 ? successful / total : 0;

    const stats: WordStats = {
        total,
        successful,
        failed,
        ratio,
    };

    return NextResponse.json(stats);
}

export async function POST(req: NextRequest) {
    const { word, definition, success } = await req.json();

    if (!word || typeof success !== 'boolean') {
        return NextResponse.json(
            { error: 'Invalid word or success value' },
            { status: 400 },
        );
    }

    const supabase = await createClient();

    const { error } = await supabase.from('training').insert({
        word,
        is_success: success,
        definition,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
