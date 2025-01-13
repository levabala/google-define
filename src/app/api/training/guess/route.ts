import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/utils/db';

export async function POST(req: NextRequest) {
    const { word, definition, success } = await req.json();

    if (!word || typeof success !== 'boolean') {
        return NextResponse.json(
            { error: 'Invalid word or success value' },
            { status: 400 },
        );
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('training')
        .insert({ 
            word,
            is_success: success,
            definition,
        });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
