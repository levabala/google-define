import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/db';
import { getUser } from '@/auth';
import { AIDefinition } from '@/app/types';
import { ai } from '@/ai';

export async function POST(req: NextRequest): Promise<NextResponse> {
    const { word } = await req.json();

    if (!word) {
        return NextResponse.json(
            { error: 'Error: the word is invalid' },
            { status: 400 },
        );
    }

    try {
        // Query AI for definition
        const aiResponse = await ai({
            messages: [
                { 
                    role: 'system', 
                    content: 'You are an English dictionary assistant. Provide a clear definition, part of speech, and 2 example sentences in JSON format.'
                },
                {
                    role: 'user',
                    content: `Define the word "${word}" in JSON format with these fields: definition (string), partOfSpeech (string), examples (array of 2 strings)`
                }
            ],
            model: 'deepseek-chat',
            response_format: { type: 'json_object' }
        });

        // Parse and validate AI response
        const aiDefinition: AIDefinition = JSON.parse(aiResponse.choices[0].message.content);

        // Save to Supabase
        const supabase = await createClient();
        const user = await getUser(req);

        // Update existing word record with AI definition
        const { error } = await supabase
            .from('word')
            .update({ 
                ai_definition: aiDefinition 
            })
            .eq('word', word)
            .eq('user', user);

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        return NextResponse.json(aiDefinition, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message || 'Unknown error occurred' },
            { status: 500 },
        );
    }
}
