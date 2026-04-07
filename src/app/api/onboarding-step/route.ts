import { NextResponse } from "next/server";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai-client";
import { ONBOARDING_SYSTEM_PROMPT } from "@/lib/onboarding-prompt";
import { fakeOnboardingStep } from "@/lib/fake-onboarding";
import type { OnboardingStepRequest } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/onboarding-step
 *
 * Recebe um turno da conversa e devolve a próxima jogada da assistente.
 * Usa OpenAI gpt-5.1 com Structured Outputs (JSON Schema strict).
 *
 * Fallback automático para fakeOnboardingStep se:
 * - OPENAI_API_KEY não existe
 * - Chamada falha ou faz timeout
 */
export async function POST(req: Request) {
  let body: OnboardingStepRequest;
  try {
    body = (await req.json()) as OnboardingStepRequest;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { collected_so_far, conversation_history, user_message } = body;

  const client = getOpenAIClient();
  if (!client) {
    return NextResponse.json(
      fakeOnboardingStep(collected_so_far, user_message),
    );
  }

  try {
    // Limita o histórico aos últimos 12 turnos pra controlar custo
    const history = (conversation_history ?? []).slice(-12).map((turn) => ({
      role: turn.role,
      content: turn.content,
    }));

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: ONBOARDING_SYSTEM_PROMPT },
        ...history,
        {
          role: "user",
          content: `Estado atual coletado: ${JSON.stringify(collected_so_far)}\n\nNova mensagem do casal: "${user_message}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "respond_to_couple",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "updates",
              "assistant_reply",
              "next_field_to_ask",
              "next_question",
              "needs_clarification",
            ],
            properties: {
              updates: {
                type: "object",
                additionalProperties: false,
                properties: {
                  phone: { type: ["string", "null"] },
                  partner_1_name: { type: ["string", "null"] },
                  partner_2_name: { type: ["string", "null"] },
                  wedding_date: { type: ["string", "null"] },
                  city: { type: ["string", "null"] },
                  state: { type: ["string", "null"] },
                  estimated_budget: { type: ["number", "null"] },
                  guest_count: { type: ["number", "null"] },
                },
                required: [
                  "phone",
                  "partner_1_name",
                  "partner_2_name",
                  "wedding_date",
                  "city",
                  "state",
                  "estimated_budget",
                  "guest_count",
                ],
              },
              assistant_reply: { type: "string" },
              next_field_to_ask: {
                type: ["string", "null"],
                enum: [
                  "phone",
                  "partner_names",
                  "wedding_date",
                  "city",
                  "estimated_budget",
                  "guest_count",
                  null,
                ],
              },
              next_question: { type: "string" },
              needs_clarification: { type: "boolean" },
            },
          },
        },
      },
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error("Resposta vazia do modelo");

    const parsed = JSON.parse(text);

    // Limpa nulls do `updates` (Structured Outputs strict obriga campos
    // obrigatórios, então o modelo retorna null pra coisas que não extraiu)
    const cleanUpdates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(parsed.updates ?? {})) {
      if (v !== null && v !== undefined && v !== "") cleanUpdates[k] = v;
    }
    parsed.updates = cleanUpdates;

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[onboarding-step] erro OpenAI:", err);
    return NextResponse.json(
      fakeOnboardingStep(collected_so_far, user_message),
    );
  }
}
