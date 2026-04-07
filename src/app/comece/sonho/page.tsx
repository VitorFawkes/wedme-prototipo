"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ChatBubble } from "@/components/onboarding/chat-bubble";
import { DreamLoading } from "@/components/onboarding/dream-loading";
import { AudioRecorder } from "@/components/onboarding/audio-recorder";
import { Ornament } from "@/components/ornaments/ornament";
import { Overline } from "@/components/ornaments/overline";
import { Badge } from "@/components/ui/badge";
import { useCouple } from "@/store/couple";
import { profiles } from "@/data/profiles";
import type { ClassifyDreamResponse, ProfileSlug } from "@/types";

/**
 * /comece/sonho — Pergunta do sonho + classificação cinematográfica.
 *
 * Fluxo:
 * 1. Bolha grande com a pergunta + textarea + botão áudio
 * 2. Ao enviar: DreamLoading full-screen mínimo 3.5s + chamada API
 * 3. Tela de revelação do perfil com chips de detected_intents
 * 4. Botão "Ver o caminho que montamos →" → /planejamento
 */

type Stage = "asking" | "loading" | "revealed";

export default function SonhoPage() {
  const router = useRouter();
  const partner_1_name = useCouple((s) => s.partner_1_name);
  const partner_2_name = useCouple((s) => s.partner_2_name);
  const setProfile = useCouple((s) => s.setProfile);
  const wedding_profile_slug = useCouple((s) => s.wedding_profile_slug);

  const [hydrated, setHydrated] = useState(false);
  const [stage, setStage] = useState<Stage>("asking");
  const [dreamText, setDreamText] = useState("");
  const [audioOpen, setAudioOpen] = useState(false);
  const [profileResult, setProfileResult] =
    useState<ClassifyDreamResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Se o casal já tem perfil classificado e volta nesta página por engano,
  // redireciona pra /planejamento (já passaram daqui). Não bloqueia o caso
  // de "Contar o sonho de novo" porque setamos profileResult ao revelar e
  // só checamos quando stage === "asking" sem profileResult.
  useEffect(() => {
    if (
      hydrated &&
      wedding_profile_slug &&
      stage === "asking" &&
      !profileResult
    ) {
      router.replace("/planejamento");
    }
  }, [hydrated, wedding_profile_slug, stage, profileResult, router]);

  async function handleSubmit() {
    if (dreamText.trim().length < 20) return;
    setStage("loading");
    setError(null);

    try {
      const [responseRaw] = await Promise.all([
        fetch("/api/classify-dream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dream_text: dreamText,
            partner_names: `${partner_1_name} & ${partner_2_name}`,
          }),
        }),
        new Promise((r) => setTimeout(r, 3500)),
      ]);

      if (!responseRaw.ok) throw new Error("API error");
      const data = (await responseRaw.json()) as ClassifyDreamResponse;

      setProfile(
        data.profile_slug as ProfileSlug,
        data.detected_intents,
        dreamText,
        data.confidence,
      );
      setProfileResult(data);
      setStage("revealed");
    } catch (err) {
      console.error("[sonho] erro:", err);
      setError("Algo deu errado. Vamos tentar de novo?");
      setStage("asking");
    }
  }

  const profileObj = profileResult
    ? profiles.find((p) => p.slug === profileResult.profile_slug)
    : null;

  if (!hydrated) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <p className="text-muted-foreground">Carregando…</p>
      </main>
    );
  }

  // === LOADING CINEMATOGRÁFICO ===
  if (stage === "loading") {
    return <DreamLoading />;
  }

  // === REVELAÇÃO DO PERFIL ===
  if (stage === "revealed" && profileObj && profileResult) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center safe-px safe-top safe-bottom px-6 md:px-12 py-16 md:py-24 text-center">
        <Ornament size="xl" className="mb-6 md:mb-8" />
        <Overline className="mb-4 md:mb-6">Perfil identificado</Overline>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground tracking-editorial leading-[1.05] max-w-3xl">
          {profileObj.name}
        </h1>
        <p className="font-display italic text-lg md:text-2xl text-muted-foreground mt-6 md:mt-8 max-w-xl leading-relaxed">
          {profileObj.description}
        </p>

        <div className="mt-10 md:mt-12 max-w-md">
          <p className="text-sm text-muted-foreground mb-4 tracking-wide">
            Detectamos em vocês:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {profileResult.detected_intents.map((intent) => (
              <Badge key={intent} variant="default" className="text-sm py-1.5 px-3">
                {intent}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-12 md:mt-16 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/planejamento")}
            className="inline-flex items-center justify-center min-h-14 px-8 md:px-10 py-4 rounded-sm bg-primary text-primary-foreground text-base md:text-lg font-medium tracking-wide hover:bg-brand-wine transition-colors duration-200"
          >
            Ver o caminho que montamos →
          </button>
          <button
            type="button"
            onClick={() => {
              setStage("asking");
              setProfileResult(null);
              setDreamText("");
            }}
            className="inline-flex items-center justify-center min-h-11 px-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Contar o sonho de novo
          </button>
        </div>
      </main>
    );
  }

  // === PERGUNTA DO SONHO ===
  return (
    <main className="min-h-dvh bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 safe-top bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <Logo className="text-base md:text-lg" />
          <div className="flex-1 max-w-xs">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: "100%" }}
                role="progressbar"
                aria-valuenow={5}
                aria-valuemin={0}
                aria-valuemax={5}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 pt-20 md:pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <ChatBubble role="assistant">
            <span className="block">
              Última pergunta, <strong>{partner_1_name}</strong> e{" "}
              <strong>{partner_2_name}</strong>. ✨
            </span>
            <span className="block mt-3 font-display text-lg md:text-xl">
              O que é o casamento para vocês — e como vocês imaginam ele?
            </span>
            <span className="block mt-3 text-sm text-muted-foreground">
              Escrevam o que vier ao coração. Pode ser uma palavra, um parágrafo,
              uma história inteira. Se preferirem, gravem um áudio.
            </span>
          </ChatBubble>

          {/* Bloco texto + áudio */}
          <div className="flex flex-col gap-4">
            <div>
              <textarea
                value={dreamText}
                onChange={(e) => setDreamText(e.target.value)}
                placeholder="Escrevam o que vem à cabeça..."
                rows={6}
                className="w-full min-h-[160px] md:min-h-[200px] rounded-sm border border-border bg-background px-4 py-3 text-base font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary leading-relaxed resize-none"
                style={{ fontSize: "16px" }}
                aria-label="Texto do sonho do casamento"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Mínimo 20 caracteres.</span>
                <span aria-live="polite">{dreamText.length}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={dreamText.trim().length < 20}
                className="flex-1 inline-flex items-center justify-center min-h-14 px-7 py-4 rounded-sm bg-primary text-primary-foreground text-base font-medium tracking-wide hover:bg-brand-wine transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none"
              >
                Enviar nosso sonho →
              </button>
              <button
                type="button"
                onClick={() => setAudioOpen(true)}
                className="inline-flex items-center justify-center gap-2 min-h-14 px-6 py-4 rounded-sm border border-border bg-card text-foreground text-sm md:text-base font-medium tracking-wide hover:border-primary transition-colors duration-200"
                aria-label="Gravar áudio em vez de digitar"
              >
                <Mic className="size-5" />
                Gravar áudio
              </button>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      <AudioRecorder
        open={audioOpen}
        onOpenChange={setAudioOpen}
        onTranscribed={(text) => {
          setDreamText(text);
        }}
      />
    </main>
  );
}
