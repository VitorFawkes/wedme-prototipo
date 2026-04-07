import { NextResponse } from "next/server";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai-client";
import {
  CLASSIFY_SYSTEM_PROMPT,
  buildClassifyUserMessage,
} from "@/lib/classify-prompt";
import { fakeClassify } from "@/lib/fake-classify";
import type { ClassifyDreamRequest, ProfileSlug } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROFILE_SLUGS: ProfileSlug[] = [
  "classico-atemporal",
  "intimo-emocional",
  "minimalista-moderno",
  "natureza-ar-livre",
  "grande-celebracao",
];

/**
 * POST /api/classify-dream
 *
 * Classifica o texto livre do sonho do casal em 1 dos 5 perfis (briefing §7).
 *
 * Usa OpenAI gpt-5.1 com Structured Outputs (json_schema strict) — o enum
 * dos 5 slugs garante que o modelo nunca retorne valor inválido.
 *
 * Fallback automático para fakeClassify se sem API key ou erro.
 */
export async function POST(req: Request) {
  let body: ClassifyDreamRequest;
  try {
    body = (await req.json()) as ClassifyDreamRequest;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { dream_text } = body;
  if (!dream_text || typeof dream_text !== "string" || dream_text.length < 10) {
    return NextResponse.json(
      { error: "Texto muito curto" },
      { status: 400 },
    );
  }

  const client = getOpenAIClient();
  if (!client) {
    return NextResponse.json(fakeClassify(dream_text));
  }

  try {
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: CLASSIFY_SYSTEM_PROMPT },
        { role: "user", content: buildClassifyUserMessage(dream_text) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "classify_wedding_dream",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "profile_slug",
              "confidence",
              "detected_intents",
              "reasoning",
            ],
            properties: {
              profile_slug: {
                type: "string",
                enum: PROFILE_SLUGS,
              },
              confidence: {
                type: "number",
                minimum: 0,
                maximum: 1,
              },
              detected_intents: {
                type: "array",
                items: { type: "string" },
                maxItems: 3,
                minItems: 1,
              },
              reasoning: { type: "string" },
            },
          },
        },
      },
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error("Resposta vazia");

    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[classify-dream] erro OpenAI:", err);
    return NextResponse.json(fakeClassify(dream_text));
  }
}
