import { getUser } from '@/auth';
import { createClient } from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const word = url.searchParams.get('word');

        if (!word) {
            return NextResponse.json(
                { error: 'Word parameter is required' },
                { status: 400 },
            );
        }

        const supabase = await createClient();
        const user = await getUser(request);
        const { data, error } = await supabase
            .from('pronunciation')
            .select('success')
            .eq('word', word)
            .eq('user', user)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        return NextResponse.json(data.map(row => row.success));
    } catch (error) {
        console.error('Error fetching recent pronunciations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recent pronunciations' },
            { status: 500 },
        );
    }
}
