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
        // Check if word exists in database
        const supabase = await createClient();
        const user = await getUser(req);

        const { data: wordDataDB } = await supabase
            .from('word')
            .select()
            .eq('word', word)
            .eq('user', user);

        const wordDataCached = wordDataDB?.[0];
        
        if (!wordDataCached) {
            // Word not found, fetch from Words API first
            const response = await fetch(`/api/words/one`, {
                method: 'POST',
                body: JSON.stringify({ word }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch word data');
            }
        }

        // Check if we already have an AI definition
        const { data: updatedWordData } = await supabase
            .from('word')
            .select()
            .eq('word', word)
            .eq('user', user)
            .single();

        if (!updatedWordData) {
            throw new Error('Word not found in database');
        }

        const existingData = JSON.parse(updatedWordData.raw);
        if (existingData.ai_definition) {
            return NextResponse.json(existingData.ai_definition, { status: 200 });
        }

        // Query AI for definition since we don't have it
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
        // Handle both streaming and non-streaming responses
        const content = 'choices' in aiResponse 
            ? aiResponse.choices[0].message.content
            : await (async () => {
                let result = '';
                for await (const chunk of aiResponse) {
                    result += chunk.choices[0]?.delta?.content || '';
                }
                return result;
            })();
            
        if (!content) {
            throw new Error('No content received from AI');
        }

        const aiDefinition: AIDefinition = JSON.parse(content);

        // Update existing word record with AI definition
        const { error } = await supabase
            .from('word')
            .update({ 
                raw: JSON.stringify({
                    ...JSON.parse(wordDataCached.raw),
                    ai_definition: aiDefinition
                }) 
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
