"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mic, Pause, Play, Send } from "lucide-react";
import { motion } from "framer-motion";
import { ChatBubble } from "@/components/onboarding/chat-bubble";
import { TypingIndicator } from "@/components/onboarding/typing-indicator";
import { DreamLoading } from "@/components/onboarding/dream-loading";
import { Ornament } from "@/components/ornaments/ornament";
import { Overline } from "@/components/ornaments/overline";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/layout/logo";
import { useCouple } from "@/store/couple";
import { profiles } from "@/data/profiles";
import type {
  ChatTurn,
  ClassifyDreamResponse,
  CollectedData,
  OnboardingStepResponse,
  ProfileSlug,
} from "@/types";

/**
 * /comece — Chat conversacional de onboarding (briefing §5.2).
 *
 * Fluxo:
 * 1. Saudação fixa + botão "Topamos"
 * 2. Cada turno chama POST /api/onboarding-step (gpt-5.1 ou fallback)
 * 3. Aplica updates no Zustand, renderiza assistant_reply + next_question
 * 4. Quando next_field_to_ask === null, mostra CTA "Contar nosso sonho →"
 *
 * Mobile: input fixed bottom com safe-bottom
 * Desktop: input inline abaixo das mensagens
 */

const GREETING = `Oi! Eu sou a assistente da we.wedme. É bem rápido, são só algumas perguntinhas pra entender o sonho de vocês e montar uma curadoria personalizada de espaços e profissionais.`;

const AUDIO_QUESTIONS_LIST = `Pra facilitar, aqui vão as perguntas. Podem responder tudo de uma vez no áudio:

1. Qual o melhor WhatsApp de vocês? (Com DDD, tipo 11 99999-1234)
2. Como vocês se chamam?
3. Já têm uma data ou ideia de mês pro casamento?
4. Em qual cidade ou região?
5. Qual o orçamento estimado?
6. Quantos convidados, mais ou menos?

Quando terminarem, é só parar a gravação.`;

type LocalTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

/**
 * Compõe a mensagem final da assistente combinando reply + next_question.
 *
 * IMPORTANTE — lógica dos 3 casos:
 *
 * 1. Ambos presentes (caso normal): concatena `reply\n\nnext_question`.
 *    Defesa extra: se o reply JÁ termina em pergunta e tem palavras que
 *    se sobrepõem à next_question, detecta duplicação e usa só o reply.
 *
 * 2. Só reply presente (ex: casal devolveu pergunta e a IA respondeu
 *    brevemente sem puxar próximo campo): usa só o reply.
 *
 * 3. Só next_question presente: usa só a pergunta.
 *
 * needs_clarification NÃO afeta a composição — mesmo em clarificação, o
 * casal PRECISA ver a nova pergunta. A flag só sinaliza ao backend que não
 * se deve gravar campos desse turno.
 */
function composeAssistantMessage(
  reply: string | undefined,
  nextQuestion: string | undefined,
): string {
  const r = (reply ?? "").trim();
  const q = (nextQuestion ?? "").trim();

  // Casos extremos: falta um ou outro.
  if (!q) return r;
  if (!r) return q;

  // Detecta duplicação: se o reply já termina em pergunta E as
  // palavras-chave coincidem com a next_question, descarta a duplicação.
  const replyEndsInQuestion = /\?\s*$/.test(r);
  const replyLastQuestion = r.match(/[^.!?]*\?\s*$/)?.[0]?.trim() ?? "";

  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,!?;:"'()]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const normReplyQ = norm(replyLastQuestion);
  const normNext = norm(q);

  if (replyEndsInQuestion && normReplyQ.length > 0) {
    const replyWords = new Set(
      normReplyQ.split(" ").filter((w) => w.length > 3),
    );
    const nextWords = normNext.split(" ").filter((w) => w.length > 3);
    if (nextWords.length === 0) return r;
    const overlap =
      nextWords.filter((w) => replyWords.has(w)).length / nextWords.length;
    if (overlap >= 0.5) {
      // Duplicação detectada — usa só o reply (que já contém a pergunta).
      return r;
    }
  }

  return `${r}\n\n${q}`;
}

export default function ComecePage() {
  const router = useRouter();
  const onboardingComplete = useCouple((s) => s.onboarding_complete);
  const phone = useCouple((s) => s.phone);
  const partner_1_name = useCouple((s) => s.partner_1_name);
  const partner_2_name = useCouple((s) => s.partner_2_name);
  const wedding_date = useCouple((s) => s.wedding_date);
  const city = useCouple((s) => s.city);
  const state = useCouple((s) => s.state);
  const estimated_budget = useCouple((s) => s.estimated_budget);
  const guest_count = useCouple((s) => s.guest_count);
  const onboarding_history = useCouple((s) => s.onboarding_history);
  const applyOnboardingUpdates = useCouple((s) => s.applyOnboardingUpdates);
  const appendChatTurn = useCouple((s) => s.appendChatTurn);
  const setProfile = useCouple((s) => s.setProfile);
  const wedding_profile_slug = useCouple((s) => s.wedding_profile_slug);

  // Local UI state — espelha o histórico do store + estado de envio
  const [hydrated, setHydrated] = useState(false);
  const [turns, setTurns] = useState<LocalTurn[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transitionReady, setTransitionReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [audioMode, setAudioMode] = useState(false);

  // Gravador inline (para audioMode — não usa drawer)
  const [inlineRecording, setInlineRecording] = useState(false);
  const [inlinePaused, setInlinePaused] = useState(false);
  const [inlineProcessing, setInlineProcessing] = useState(false);
  const [inlineSeconds, setInlineSeconds] = useState(0);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const inlineRecorderRef = useRef<MediaRecorder | null>(null);
  const inlineChunksRef = useRef<Blob[]>([]);
  const inlineTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inlineStreamRef = useRef<MediaStream | null>(null);

  // Dream mode states
  const [dreamMode, setDreamMode] = useState(false);
  const [dreamText, setDreamText] = useState("");
  const [dreamTextMode, setDreamTextMode] = useState(false);
  const [dreamStage, setDreamStage] = useState<"asking" | "loading" | "revealed">("asking");
  const [profileResult, setProfileResult] = useState<ClassifyDreamResponse | null>(null);
  const dreamTextareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hidrata e popula turns do histórico salvo
  useEffect(() => {
    setHydrated(true);
    if (onboarding_history.length > 0) {
      setTurns(
        onboarding_history.map((t, i) => ({
          id: `hist-${i}`,
          role: t.role,
          content: t.content,
        })),
      );
      setHasStarted(true);
    }
  }, [onboarding_history.length]); // só na primeira hidratação

  // Redireciona se onboarding já completo e perfil já classificado
  useEffect(() => {
    if (hydrated && onboardingComplete && wedding_profile_slug) {
      router.replace("/planejamento");
    }
  }, [hydrated, onboardingComplete, wedding_profile_slug, router]);

  // Auto-scroll ao fim a cada nova mensagem.
  // Usa scrollTop direto no container (em vez de scrollIntoView) porque
  // scrollIntoView não funciona consistente em iOS quando há um elemento
  // fixed (input do chat) e o teclado virtual está aberto.
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      return;
    }
    // Fallback global
    requestAnimationFrame(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [turns.length, isLoading]);

  // Conta campos coletados pra barra de progresso
  const collected: CollectedData = {
    phone: phone ?? undefined,
    partner_1_name: partner_1_name ?? undefined,
    partner_2_name: partner_2_name ?? undefined,
    wedding_date: wedding_date ?? undefined,
    city: city ?? undefined,
    state: state ?? undefined,
    estimated_budget: estimated_budget ?? undefined,
    guest_count: guest_count ?? undefined,
  };
  const collectedCount = [
    phone,
    partner_1_name && partner_2_name,
    wedding_date,
    city,
    estimated_budget,
    guest_count,
  ].filter(Boolean).length;
  const progress = (collectedCount / 6) * 100;

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading) return;

      // Adiciona mensagem do usuário
      const userTurn: LocalTurn = {
        id: `u-${Date.now()}`,
        role: "user",
        content: message,
      };
      setTurns((prev) => [...prev, userTurn]);

      const userChatTurn: ChatTurn = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      appendChatTurn(userChatTurn);

      setIsLoading(true);
      setInputValue("");

      // Histórico até este turno (sem o que acabou de ser adicionado, pra não duplicar)
      const conversation_history = onboarding_history.map((t) => ({
        role: t.role,
        content: t.content,
      }));

      try {
        const startTime = Date.now();

        // Promise.all com sleep mínimo de 900ms pra typing indicator
        const [responseRaw] = await Promise.all([
          fetch("/api/onboarding-step", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              collected_so_far: collected,
              conversation_history,
              user_message: message,
            }),
          }),
          new Promise((r) => setTimeout(r, 900)),
        ]);

        if (!responseRaw.ok) throw new Error("API error");
        const data = (await responseRaw.json()) as OnboardingStepResponse;

        // Garante mínimo 900ms total já contado
        const elapsed = Date.now() - startTime;
        if (elapsed < 1200) {
          await new Promise((r) => setTimeout(r, 1200 - elapsed));
        }

        // Aplica updates no store
        if (data.updates && Object.keys(data.updates).length > 0) {
          applyOnboardingUpdates(data.updates);
        }

        // Adiciona resposta da assistente: reply + (se houver) próxima pergunta.
        // Defesa contra IA duplicando a pergunta dentro de assistant_reply.
        const assistantContent = composeAssistantMessage(
          data.assistant_reply,
          data.next_question,
        );

        if (assistantContent && assistantContent.trim()) {
          const assistantTurn: LocalTurn = {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: assistantContent.trim(),
          };
          setTurns((prev) => [...prev, assistantTurn]);
          appendChatTurn({
            role: "assistant",
            content: assistantContent.trim(),
            timestamp: new Date().toISOString(),
          });
        }

        // Se a transição final chegou, entra no modo sonho
        if (data.next_field_to_ask === null) {
          setTransitionReady(true);
          setDreamMode(true);

          // Adiciona a pergunta do sonho como nova mensagem após um delay
          setTimeout(() => {
            const p1 = useCouple.getState().partner_1_name ?? "";
            const p2 = useCouple.getState().partner_2_name ?? "";
            const dreamQuestion = `Agora, ${p1} e ${p2}, a pergunta que mais importa:\n\nO que é o casamento para vocês, e como vocês imaginam ele?\n\nEscrevam o que vier ao coração. Pode ser uma palavra, um parágrafo, uma história inteira. Se preferirem, gravem um áudio.`;
            const dreamTurn: LocalTurn = {
              id: `a-dream-${Date.now()}`,
              role: "assistant",
              content: dreamQuestion,
            };
            setTurns((prev) => [...prev, dreamTurn]);
            appendChatTurn({
              role: "assistant",
              content: dreamQuestion,
              timestamp: new Date().toISOString(),
            });
          }, 1500);
        }
      } catch (err) {
        console.error("[comece] erro:", err);
        const errorTurn: LocalTurn = {
          id: `e-${Date.now()}`,
          role: "assistant",
          content:
            "Travei aqui, me dá um segundo... Pode tentar de novo?",
        };
        setTurns((prev) => [...prev, errorTurn]);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [
      isLoading,
      collected,
      onboarding_history,
      applyOnboardingUpdates,
      appendChatTurn,
    ],
  );

  async function submitDream(text: string) {
    if (text.trim().length < 20) return;
    setDreamStage("loading");

    try {
      const p1 = useCouple.getState().partner_1_name ?? "";
      const p2 = useCouple.getState().partner_2_name ?? "";

      const [responseRaw] = await Promise.all([
        fetch("/api/classify-dream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dream_text: text,
            partner_names: `${p1} & ${p2}`,
          }),
        }),
        new Promise((r) => setTimeout(r, 3500)),
      ]);

      if (!responseRaw.ok) throw new Error("API error");
      const data = (await responseRaw.json()) as ClassifyDreamResponse;

      setProfile(
        data.profile_slug as ProfileSlug,
        data.detected_intents,
        text,
        data.confidence,
      );
      useCouple.getState().markOnboardingComplete();
      setProfileResult(data);
      setDreamStage("revealed");
    } catch (err) {
      console.error("[sonho] erro:", err);
      setDreamStage("asking");
    }
  }

  function handleDreamSubmit() {
    submitDream(dreamText);
  }

  // === Gravador inline unificado (usado tanto no onboarding quanto no sonho) ===

  async function inlineStartRecording() {
    setInlineError(null);
    setInlinePaused(false);
    // Limpa timer anterior pra evitar múltiplos intervalos
    if (inlineTimerRef.current) { clearInterval(inlineTimerRef.current); inlineTimerRef.current = null; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      inlineStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      inlineRecorderRef.current = recorder;
      inlineChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) inlineChunksRef.current.push(e.data);
      };

      recorder.start();
      setInlineRecording(true);
      setInlineSeconds(0);
      inlineTimerRef.current = setInterval(() => {
        setInlineSeconds((s) => {
          if (s >= 179) { inlinePauseRecording(); return 180; }
          return s + 1;
        });
      }, 1000);
    } catch { setInlineError("Não foi possível acessar o microfone."); }
  }

  function inlinePauseRecording() {
    if (inlineRecorderRef.current?.state === "recording") {
      inlineRecorderRef.current.pause();
    }
    if (inlineTimerRef.current) { clearInterval(inlineTimerRef.current); inlineTimerRef.current = null; }
    setInlinePaused(true);
  }

  function inlineResumeRecording() {
    if (inlineRecorderRef.current?.state === "paused") {
      inlineRecorderRef.current.resume();
    }
    setInlinePaused(false);
    // Limpa timer anterior pra evitar múltiplos intervalos
    if (inlineTimerRef.current) { clearInterval(inlineTimerRef.current); inlineTimerRef.current = null; }
    inlineTimerRef.current = setInterval(() => {
      setInlineSeconds((s) => {
        if (s >= 179) { inlinePauseRecording(); return 180; }
        return s + 1;
      });
    }, 1000);
  }

  async function inlineSendRecording() {
    if (!inlineRecorderRef.current) return;

    setInlineProcessing(true);
    setInlinePaused(false);
    setInlineRecording(false);
    setInlineSeconds(0);
    if (inlineTimerRef.current) { clearInterval(inlineTimerRef.current); inlineTimerRef.current = null; }

    // Parar o recorder gera o blob via onstop
    const recorder = inlineRecorderRef.current;
    recorder.onstop = async () => {
      const blob = new Blob(inlineChunksRef.current, { type: "audio/webm" });
      try {
        const formData = new FormData();
        formData.append("file", blob, "audio.webm");
        const res = await fetch("/api/transcribe", { method: "POST", body: formData });
        if (res.status === 503) { setInlineError("Transcrição indisponível. Tente digitar."); setInlineProcessing(false); return; }
        if (!res.ok) throw new Error("Falha");
        const data = await res.json();
        if (data.text) {
          if (dreamMode) {
            // No modo sonho: classificar direto, não precisa de textarea
            setDreamText(data.text);
            setInlineProcessing(false);
            // Submeter automaticamente
            submitDream(data.text);
          } else {
            setAudioMode(false);
            setInlineProcessing(false);
            sendMessage(data.text);
          }
        }
      } catch {
        setInlineError("Não conseguimos processar o áudio. Tentem de novo.");
        setInlineProcessing(false);
      } finally {
        inlineStreamRef.current?.getTracks().forEach((t) => t.stop());
        inlineStreamRef.current = null;
        inlineRecorderRef.current = null;
      }
    };

    if (recorder.state !== "inactive") {
      recorder.stop();
    }
  }

  function inlineDiscardRecording() {
    if (inlineRecorderRef.current?.state !== "inactive") {
      try { inlineRecorderRef.current?.stop(); } catch { /* ignore */ }
    }
    setInlineRecording(false);
    setInlinePaused(false);
    setInlineSeconds(0);
    if (inlineTimerRef.current) { clearInterval(inlineTimerRef.current); inlineTimerRef.current = null; }
    inlineStreamRef.current?.getTracks().forEach((t) => t.stop());
    inlineStreamRef.current = null;
    inlineRecorderRef.current = null;
  }

  function handleStartText() {
    setHasStarted(true);
    const firstQuestion: LocalTurn = {
      id: `a-intro-${Date.now()}`,
      role: "assistant",
      content:
        "Que bom! Pra começar, qual o melhor WhatsApp pra gente se comunicar com vocês? (Com DDD, tipo 11 99999-1234)",
    };
    setTurns((prev) => [...prev, firstQuestion]);
    appendChatTurn({
      role: "assistant",
      content: firstQuestion.content,
      timestamp: new Date().toISOString(),
    });
  }

  function handleStartAudio() {
    setHasStarted(true);
    setAudioMode(true);
    const questionsTurn: LocalTurn = {
      id: `a-questions-${Date.now()}`,
      role: "assistant",
      content: AUDIO_QUESTIONS_LIST,
    };
    setTurns((prev) => [...prev, questionsTurn]);
    appendChatTurn({
      role: "assistant",
      content: questionsTurn.content,
      timestamp: new Date().toISOString(),
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(inputValue);
  }

  if (!hydrated) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <p className="text-muted-foreground">Carregando…</p>
      </main>
    );
  }

  if (dreamStage === "loading") {
    return <DreamLoading />;
  }

  return (
    <main className="min-h-dvh flex flex-col bg-background">
      {/* Header com logo + barra de progresso */}
      <header className="fixed top-0 left-0 right-0 z-30 safe-top bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="we.wedme — voltar para a home"
            className="inline-flex items-center min-h-11 -ml-1 px-1"
          >
            <Logo className="text-base md:text-lg" />
          </Link>
          <div className="flex-1 max-w-xs">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={collectedCount}
                aria-valuemin={0}
                aria-valuemax={6}
                aria-label="Progresso do onboarding"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              useCouple.getState().reset();
              router.replace("/");
            }}
            className="inline-flex items-center justify-center min-h-11 min-w-11 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Reiniciar simulação"
          >
            Reiniciar
          </button>
        </div>
      </header>

      {/* Conversa */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto pt-20 md:pt-24 pb-52 md:pb-40 safe-px"
      >
        <div className="max-w-2xl mx-auto px-4 md:px-0 flex flex-col gap-4 md:gap-5">
          {/* Saudação fixa inicial */}
          <ChatBubble role="assistant">{GREETING}</ChatBubble>

          {!hasStarted && (
            <div className="flex flex-col gap-2 items-start">
              <button
                type="button"
                onClick={handleStartAudio}
                className="inline-flex items-center justify-center gap-2 min-h-12 px-7 py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium tracking-wide shadow-md shadow-primary/25 hover:bg-brand-wine hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 transition-all duration-300 ease-out"
              >
                <Mic className="size-4" />
                Responder por áudio
              </button>
              <button
                type="button"
                onClick={handleStartText}
                className="inline-flex items-center justify-center gap-2 min-h-12 px-7 py-3 rounded-md border border-border bg-card text-foreground text-sm font-medium tracking-wide hover:border-primary hover:shadow-sm transition-all duration-300"
              >
                Prefiro digitar
              </button>
            </div>
          )}

          {/* Turnos dinâmicos */}
          {turns.map((turn) => (
            <ChatBubble key={turn.id} role={turn.role}>
              {turn.content.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i < turn.content.split("\n").length - 1 && <br />}
                </span>
              ))}
            </ChatBubble>
          ))}

          {isLoading && <TypingIndicator />}

          {/* Perfil revelado inline */}
          {dreamStage === "revealed" && profileResult && (() => {
            const profileObj = profiles.find((p) => p.slug === profileResult.profile_slug);
            if (!profileObj) return null;
            return (
              <div className="flex flex-col items-center text-center py-8 md:py-12 gap-6">
                <Ornament size="xl" />
                <Overline>Perfil identificado</Overline>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground tracking-editorial leading-[1.05] max-w-2xl">
                  {profileObj.name}
                </h2>
                <p className="font-display italic text-base md:text-xl text-muted-foreground max-w-md leading-relaxed">
                  {profileObj.description}
                </p>
                <div className="max-w-md">
                  <p className="text-sm text-muted-foreground mb-3 tracking-wide">
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
                <button
                  type="button"
                  onClick={() => router.push("/planejamento")}
                  className="inline-flex items-center justify-center min-h-14 px-8 md:px-10 py-4 rounded-md bg-primary text-primary-foreground text-base md:text-lg font-medium tracking-wide hover:bg-brand-wine hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 transition-all duration-300 ease-out mt-4"
                >
                  Ver o caminho que montamos →
                </button>
              </div>
            );
          })()}

          <div ref={scrollAnchorRef} />
        </div>
      </div>

      {/* Input do chat (campos do onboarding) — modo texto */}
      {hasStarted && !dreamMode && !audioMode && (
        <div className="fixed bottom-0 left-0 right-0 z-30 safe-bottom safe-px bg-background border-t border-border">
          <div className="max-w-2xl mx-auto px-4 md:px-0 py-3 md:py-6">
            {/* Gravando/pausado/processando inline no modo texto */}
            {inlineProcessing ? (
              <div className="flex items-center justify-center gap-3 py-2">
                <span className="text-[color:var(--brand-rose)] text-2xl animate-pulse-ornament">◇</span>
                <span className="text-sm text-muted-foreground">Transcrevendo...</span>
              </div>
            ) : inlineRecording || inlinePaused ? (
              <div className="flex items-center gap-3 w-full">
                {/* Timer */}
                <span className="font-display text-xl text-foreground tabular-nums min-w-[3.5rem] text-center">
                  {Math.floor(inlineSeconds / 60)}:{(inlineSeconds % 60).toString().padStart(2, "0")}
                </span>

                {inlinePaused ? (
                  <>
                    <button
                      type="button"
                      onClick={inlineResumeRecording}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-11 rounded-sm border border-border bg-card text-foreground text-sm font-medium hover:border-primary transition-colors duration-200"
                    >
                      <Play className="size-4" />
                      Retomar
                    </button>
                    <button
                      type="button"
                      onClick={inlineSendRecording}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-brand-wine hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 transition-all duration-300 ease-out"
                    >
                      <Send className="size-4" />
                      Enviar
                    </button>
                    <button
                      type="button"
                      onClick={() => { inlineDiscardRecording(); inlineStartRecording(); }}
                      className="shrink-0 inline-flex items-center justify-center min-w-11 min-h-11 rounded-sm border border-border bg-card text-foreground hover:border-primary transition-colors duration-200"
                      aria-label="Recomeçar gravação"
                    >
                      <Mic className="size-4" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Barra de onda animada */}
                    <div className="flex-1 flex items-center gap-[3px] h-8 px-2">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-full bg-primary/60"
                          animate={{ height: ["4px", `${8 + Math.random() * 16}px`, "4px"] }}
                          transition={{ duration: 0.6 + Math.random() * 0.6, repeat: Infinity, delay: i * 0.04 }}
                        />
                      ))}
                    </div>
                    <motion.button
                      type="button"
                      onClick={inlinePauseRecording}
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-destructive text-white"
                      aria-label="Pausar gravação"
                    >
                      <Pause className="size-4 fill-white" />
                    </motion.button>
                  </>
                )}
              </div>
            ) : (
              /* Input texto normal */
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  rows={1}
                  placeholder="Respondam aqui..."
                  enterKeyHint="send"
                  autoComplete="off"
                  disabled={isLoading}
                  className="flex-1 resize-none rounded-sm border border-border bg-background px-3 py-2.5 text-base font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 max-h-32 leading-normal overflow-hidden"
                  style={{ fontSize: "16px", height: "44px" }}
                />
                <button
                  type="button"
                  onClick={inlineStartRecording}
                  disabled={isLoading}
                  className="shrink-0 inline-flex items-center justify-center min-w-11 min-h-11 rounded-sm border border-border bg-card text-foreground hover:border-primary transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none"
                  aria-label="Gravar áudio"
                >
                  <Mic className="size-5" />
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="shrink-0 inline-flex items-center justify-center min-w-11 min-h-11 rounded-md bg-primary text-primary-foreground hover:bg-brand-wine hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 transition-all duration-300 ease-out disabled:opacity-40 disabled:pointer-events-none"
                  aria-label="Enviar mensagem"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14m-7-7l7 7-7 7"
                    />
                  </svg>
                </button>
              </form>
            )}
            {inlineError && (
              <p className="text-sm text-destructive text-center mt-2">{inlineError}</p>
            )}
          </div>
        </div>
      )}

      {/* Gravador inline unificado — onboarding (audioMode) e sonho (dreamMode sem dreamTextMode) */}
      {((hasStarted && audioMode && !dreamMode) || (dreamMode && dreamStage === "asking" && !dreamTextMode)) && (
        <div className="fixed bottom-0 left-0 right-0 z-30 safe-bottom safe-px bg-background border-t border-border">
          <div className="max-w-2xl mx-auto px-4 md:px-0 py-4 flex flex-col items-center gap-2">
            {inlineProcessing ? (
              <div className="flex items-center gap-3 py-3">
                <span className="text-[color:var(--brand-rose)] text-2xl animate-pulse-ornament">◇</span>
                <span className="text-sm text-muted-foreground">Transcrevendo...</span>
              </div>
            ) : inlinePaused ? (
              <div className="flex flex-col items-center gap-3 w-full">
                <span className="font-display text-2xl text-foreground tabular-nums">
                  {Math.floor(inlineSeconds / 60)}:{(inlineSeconds % 60).toString().padStart(2, "0")}
                </span>
                <div className="flex items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={inlineResumeRecording}
                    className="flex-1 inline-flex items-center justify-center gap-2 min-h-12 rounded-sm border border-border bg-card text-foreground text-sm font-medium tracking-wide hover:border-primary transition-colors duration-200"
                  >
                    <Play className="size-4" />
                    Retomar
                  </button>
                  <button
                    type="button"
                    onClick={inlineSendRecording}
                    className="flex-1 inline-flex items-center justify-center gap-2 min-h-12 rounded-md bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-brand-wine hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 transition-all duration-300 ease-out"
                  >
                    <Send className="size-4" />
                    Enviar
                  </button>
                  <button
                    type="button"
                    onClick={() => { inlineDiscardRecording(); inlineStartRecording(); }}
                    className="flex-1 inline-flex items-center justify-center gap-2 min-h-12 rounded-sm border border-border bg-card text-foreground text-sm font-medium tracking-wide hover:border-primary transition-colors duration-200"
                  >
                    <Mic className="size-4" />
                    Recomeçar
                  </button>
                </div>
              </div>
            ) : inlineRecording ? (
              <div className="flex items-center gap-4 w-full justify-center">
                <span className="font-display text-2xl text-foreground tabular-nums">
                  {Math.floor(inlineSeconds / 60)}:{(inlineSeconds % 60).toString().padStart(2, "0")}
                </span>
                <motion.button
                  type="button"
                  onClick={inlinePauseRecording}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-destructive text-white"
                  aria-label="Pausar gravação"
                >
                  <Pause className="size-5 fill-white" />
                </motion.button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={inlineStartRecording}
                  className="w-full inline-flex items-center justify-center gap-3 min-h-14 px-8 py-4 rounded-md bg-primary text-primary-foreground text-base font-medium tracking-wide hover:bg-brand-wine hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 transition-all duration-300 ease-out"
                >
                  <Mic className="size-5" />
                  Gravar áudio
                </button>
                <button
                  type="button"
                  onClick={() => dreamMode ? setDreamTextMode(true) : setAudioMode(false)}
                  className="inline-flex items-center justify-center min-h-11 px-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Prefiro digitar
                </button>
              </>
            )}
            {inlineError && (
              <p className="text-sm text-destructive text-center">{inlineError}</p>
            )}
          </div>
        </div>
      )}

      {/* Input do sonho modo texto (quando clicou "Prefiro digitar" no dream) */}
      {dreamMode && dreamStage === "asking" && dreamTextMode && (
        <div className="fixed bottom-0 left-0 right-0 z-30 safe-bottom safe-px bg-background border-t border-border">
          <div className="max-w-2xl mx-auto px-4 md:px-0 py-3 flex flex-col gap-2">
            <textarea
              ref={dreamTextareaRef}
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              placeholder="Escrevam o que vem à cabeça..."
              rows={3}
              className="w-full resize-none rounded-sm border border-border bg-background px-3 py-2.5 text-base font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary leading-normal"
              style={{ fontSize: "16px" }}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDreamSubmit}
                disabled={dreamText.trim().length < 20}
                className="flex-1 inline-flex items-center justify-center min-h-12 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-brand-wine hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 transition-all duration-300 ease-out disabled:opacity-40 disabled:pointer-events-none"
              >
                Enviar →
              </button>
              <button
                type="button"
                onClick={() => setDreamTextMode(false)}
                className="inline-flex items-center justify-center min-h-12 px-4 rounded-sm border border-border bg-card text-foreground hover:border-primary transition-colors duration-200"
                aria-label="Gravar áudio"
              >
                <Mic className="size-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
