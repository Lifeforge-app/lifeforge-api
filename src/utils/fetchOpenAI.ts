import Groq from "groq-sdk";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export async function fetchOpenAI(
  apiKey: string,
  model: string,
  messages: ChatCompletionMessageParam[]
): Promise<string | null> {
  const openai = new OpenAI({
    apiKey,
  });

  const completion = await openai.chat.completions.create({
    model,
    messages,
  });

  const res = completion.choices[0]?.message?.content;

  if (!res) {
    return null;
  }

  return res;
}
