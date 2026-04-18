import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { systemPrompt } from "@/lib/data";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
