import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/authorization';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

const requestSchema = z.object({
  text: z.string().min(1).max(5000),
});

export async function POST(req: Request) {
  try {
    const session = await requirePermission('sms.draft'); // Require auth before using AI
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in the environment.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const result = requestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.errors },
        { status: 400 }
      );
    }

    const { text } = result.data;

    const client = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a professional linguist, grammar expert, and editor.
Your task is to analyze the provided text for grammar, spelling, punctuation, and sentence sense. 
The text might be in English, or in any Ugandan language (e.g., Luganda, Runyankole, Lusoga, Swahili, etc.).
Determine the language first.
Check if the sentence makes logical sense.
Provide suggestions for corrections.
Return a STRICT JSON response using the following schema (and DO NOT use markdown code blocks, just pure JSON):
{
  "status": "perfect" | "corrections_needed",
  "sense": boolean,
  "language": "string (detected language)",
  "corrected_text": "string (the fully corrected version of the text, or original if perfect)",
  "suggestions": [
    { "original": "wrong part", "replacement": "correct part", "reason": "why" }
  ],
  "feedback": "string (general feedback on sense and grammar)"
}`;

    const interaction = await client.interactions.create({
      model: 'gemini-3.8-flash',
      input: text,
      system_instruction: systemInstruction,
    });

    let rawOutput = interaction.output_text || '{}';
    // Clean up potential markdown formatting if model didn't obey
    rawOutput = rawOutput.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    
    const parsed = JSON.parse(rawOutput);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Grammar check error:', error);
    return NextResponse.json(
      { error: 'Failed to process grammar check' },
      { status: 500 }
    );
  }
}
