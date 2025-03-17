import Groq from "groq-sdk";
import { ChatCompletionMessageParam as GroqChatCompletionMessageParam } from "groq-sdk/resources/chat/completions.mjs";
import OpenAI from "openai";
import { ChatCompletionMessageParam as OpenAIChatCompletionMessageParam } from "openai/resources/index.mjs";

export interface FetchAIParams {
  provider: "groq" | "openai";
  apiKey: string;
  model: string;
  messages: GroqChatCompletionMessageParam | OpenAIChatCompletionMessageParam[];
}

export async function fetchAI({
  provider,
  apiKey,
  model,
  messages,
}: FetchAIParams): Promise<string | null> {
  const client = new {
    groq: Groq,
    openai: OpenAI,
  }[provider]({
    apiKey,
  });

  // @ts-ignore
  const response = await client.chat.completions.create({
    messages,
    model,
  });

  const res = response.choices[0]?.message?.content;

  if (!res) {
    return null;
  }

  return res;
}
