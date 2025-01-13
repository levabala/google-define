import { createClient } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
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
        const { data, error } = await supabase
            .from('pronunciation')
            .select('success')
            .eq('word', word);

        if (error) throw error;

        const total = data.length;
        const successful = data.filter(row => row.success).length;
        const failed = total - successful;
        const ratio = total > 0 ? successful / total : 0;

        return NextResponse.json({
            total,
            successful,
            failed,
            ratio,
        });
    } catch (error) {
        console.error('Error fetching pronunciation stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pronunciation stats' },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { word, recognised_text, success } = await request.json();

        const { error } = await supabase.from('pronunciation').insert({
            word,
            recognised_text,
            success,
        });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving pronunciation:', error);
        return NextResponse.json(
            { error: 'Failed to save pronunciation' },
            { status: 500 },
        );
    }
}
