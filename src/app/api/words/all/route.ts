import { NextResponse } from 'next/server';
import { createClient } from '@/utils/db';

export async function GET(): Promise<NextResponse> {
    try {
        const supabase = await createClient();
        const { data } = await supabase.from('word').select().order('word');

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message || 'Unknown error occurred' },
            { status: 500 },
        );
    }
}
