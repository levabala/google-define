import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/db';
import { getUser } from '@/auth';

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const user = await getUser(req);

        const supabase = await createClient();
        const { data } = await supabase
            .from('word')
            .select()
            .eq('user', user)
            .order('status')
            .order('word');

        if (!data) {
            return NextResponse.json({ error: 'No words found' }, { status: 404 });
        }

        return NextResponse.json(data.map(w => ({...w, raw: JSON.parse(w.raw)})), { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message || 'Unknown error occurred' },
            { status: 500 },
        );
    }
}
