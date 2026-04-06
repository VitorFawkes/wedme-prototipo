import type { ClassifyDreamResponse, ProfileSlug } from "@/types";
import { profiles } from "@/data/profiles";

/**
 * Fallback local de `/api/classify-dream` quando OPENAI_API_KEY não existe.
 *
 * Estratégia: lowercase + tokenização simples + count de matches contra
 * `detection_keywords` de cada perfil. O perfil com mais matches ganha.
 *
 * Em empate ou zero matches, retorna `classico-atemporal` como default.
 * Confidence simulada entre 0.65 e 0.85.
 */

export function fakeClassify(dreamText: string): ClassifyDreamResponse {
  const text = dreamText.toLowerCase();

  let bestProfile: ProfileSlug = "classico-atemporal";
  let bestScore = 0;
  let detectedIntents: string[] = [];

  for (const profile of profiles) {
    const matches = profile.detection_keywords.filter((kw) =>
      text.includes(kw.toLowerCase()),
    );
    if (matches.length > bestScore) {
      bestScore = matches.length;
      bestProfile = profile.slug;
      detectedIntents = matches.slice(0, 3);
    }
  }

  // Confidence: 0.65 base + 0.05 por match, capped em 0.88
  const confidence = Math.min(0.88, 0.65 + bestScore * 0.05);

  // Se zero matches, intents são genéricas para o perfil default
  if (detectedIntents.length === 0) {
    detectedIntents = ["tradição", "elegância", "celebração"];
  }

  const profile = profiles.find((p) => p.slug === bestProfile);

  return {
    profile_slug: bestProfile,
    confidence,
    detected_intents: detectedIntents,
    reasoning: profile
      ? `Detectamos ${bestScore} sinais alinhados com ${profile.name}.`
      : "Análise por keyword matching local.",
  };
}
