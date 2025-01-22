import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/db';
import { getUser } from '@/auth';

export async function POST(req: NextRequest) {
    const { word, answer } = await req.json();
    
    if (!word || !answer) {
        return NextResponse.json(
            { error: 'Missing word or answer' },
            { status: 400 }
        );
    }

    const supabase = await createClient();
    const user = await getUser(req);

    // Calculate letter differences
    const errors = calculateSpellingErrors(word, answer);

    const { error } = await supabase.from('training_spelling').insert({
        word,
        answer,
        errors_count: errors,
        user
    });

    if (error) {
        throw new Error(error.message);
    }

    return NextResponse.json({ 
        success: errors === 0,
        errors 
    }, { status: 200 });
}

function calculateSpellingErrors(expected: string, actual: string): number {
    const cleanExpected = expected.toLowerCase().trim();
    const cleanActual = actual.toLowerCase().trim();
    
    let errors = Math.abs(cleanExpected.length - cleanActual.length);
    
    for (let i = 0; i < Math.min(cleanExpected.length, cleanActual.length); i++) {
        if (cleanExpected[i] !== cleanActual[i]) errors++;
    }
    
    return errors;
}
