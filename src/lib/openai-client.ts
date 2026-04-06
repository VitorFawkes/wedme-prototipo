import OpenAI from "openai";

/**
 * Singleton OpenAI client. Lazy: só instancia se a chave existir.
 *
 * NUNCA use isto em Client Components — apenas em Route Handlers
 * (src/app/api/) e Server Components.
 */

let cached: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (cached) return cached;
  cached = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return cached;
}

export const OPENAI_MODEL = "gpt-5.1";
