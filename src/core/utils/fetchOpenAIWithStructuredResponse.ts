import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { ChatCompletionMessageParam as OpenAIChatCompletionMessageParam } from "openai/resources/index.mjs";
import { z } from "zod";

export interface FetchAIWithStructuredResponseParams {
  apiKey: string;
  model: string;
  messages: OpenAIChatCompletionMessageParam[];
  structure: z.ZodType<any, any>;
  structName: string;
}

export async function fetchAIWithStructuredResponse({
  apiKey,
  model,
  messages,
  structure,
  structName,
}: FetchAIWithStructuredResponseParams): Promise<string | null> {
  const client = new OpenAI({
    apiKey,
  });

  const completion = await client.beta.chat.completions.parse({
    model,
    messages,
    response_format: zodResponseFormat(structure, structName),
  });

  const response = completion.choices[0].message.parsed;

  if (!response) {
    return null;
  }

  return response;
}
