import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/db";
import { getUser } from "@/auth";
import { AIDefinitionSchema } from "@/app/old/schemas";
import { ai } from "@/ai";

export async function POST(req: NextRequest): Promise<NextResponse> {
    const { word } = await req.json();

    if (!word) {
        return NextResponse.json(
            { error: "Error: the word is invalid" },
            { status: 400 },
        );
    }

    try {
        // Check if word exists in database
        const supabase = await createClient();
        const user = await getUser(req);

        const { data: wordDB } = await supabase
            .from("word")
            .select()
            .eq("word", word)
            .eq("user", user).single();
        
        if (!wordDB) {
            throw new Error('No such word acquired');
        }

        if (wordDB.ai_definition) {
            return NextResponse.json(wordDB.ai_definition, {
                status: 200,
            });
        }

        // Query AI for definition since we don't have it
        const aiResponse = await ai({
            messages: [
                {
                    role: "system",
                    content:
                        "You are an English dictionary assistant. Provide a clear definition that does not use the target word or any of its derivatives, along with its part of speech and 2 example sentences in JSON format. The definition should be understandable without knowing the target word. Do not capitalize the first letter of sentences in the definition or examples.",
                },
                {
                    role: "user",
                    content: `Define the word "${word}" in JSON format with these fields: definition (string), partOfSpeech (string), examples (array of 2 strings)`,
                },
            ],
            model: "deepseek-chat",
            response_format: { type: "json_object" },
        });

        // Parse and validate AI response
        // Handle both streaming and non-streaming responses
        const content =
            "choices" in aiResponse
                ? aiResponse.choices[0].message.content
                : await (async () => {
                      let result = "";
                      for await (const chunk of aiResponse) {
                          result += chunk.choices[0]?.delta?.content || "";
                      }
                      return result;
                  })();

        if (!content) {
            throw new Error("No content received from AI");
        }

        const aiDefinition = AIDefinitionSchema.parse(JSON.parse(content));

        // Update existing word record with AI definition
        const { error } = await supabase
            .from("word")
            .update({
                ai_definition: aiDefinition,
            })
            .eq("word", word)
            .eq("user", user);

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        return NextResponse.json(aiDefinition, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message || "Unknown error occurred" },
            { status: 500 },
        );
    }
}
