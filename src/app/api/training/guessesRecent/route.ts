import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/db';
import { getUser } from '@/auth';

export async function GET(req: NextRequest) {
    const word = req.nextUrl.searchParams.get('word');

    if (!word) {
        return NextResponse.json(
            { error: 'Word parameter is required' },
            { status: 400 },
        );
    }

    const supabase = await createClient();

    const user = await getUser(req);
    const { data, error } = await supabase
        .from('training')
        .select('is_success')
        .eq('word', word)
        .eq('user', user)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const recentGuesses = data.map(row => row.is_success);

    return NextResponse.json(recentGuesses);
}
