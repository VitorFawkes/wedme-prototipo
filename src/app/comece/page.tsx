"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChatBubble } from "@/components/onboarding/chat-bubble";
import { TypingIndicator } from "@/components/onboarding/typing-indicator";
import { Logo } from "@/components/layout/logo";
import { useCouple } from "@/store/couple";
import type {
  ChatTurn,
  CollectedData,
  OnboardingStepResponse,
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

const GREETING = `Oi. Eu sou a assistente da we.wedme. Estou aqui para entender como vocês imaginam o casamento e montar um caminho feito sob medida. Topam começar com algumas perguntas rápidas?`;

type LocalTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

/**
 * Compõe a mensagem final da assistente combinando reply + next_question.
 *
 * Defesa contra IA duplicando: se assistant_reply já contiver a pergunta
 * (ou algo muito parecido), NÃO concatena — usa só o reply.
 */
function composeAssistantMessage(
  reply: string | undefined,
  nextQuestion: string | undefined,
  needsClarification: boolean,
): string {
  const r = (reply ?? "").trim();
  const q = (nextQuestion ?? "").trim();

  // Sem pergunta seguinte, ou em modo clarificação → só o reply
  if (!q || needsClarification) return r || q;
  if (!r) return q;

  // Detecta se o reply já termina com uma pergunta (provavelmente é a próxima)
  // ou se as últimas palavras do reply aparecem na pergunta
  const replyEndsInQuestion = /\?\s*$/.test(r);

  // Pega a parte do reply que pode estar duplicada (último ?)
  const replyLastQuestion = r.match(/[^.!?]*\?\s*$/)?.[0]?.trim() ?? "";

  // Normaliza pra comparar (lowercase, remove pontuação, espaços extras)
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,!?;:"'()]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const normReplyQ = norm(replyLastQuestion);
  const normNext = norm(q);

  // Se o reply já termina em pergunta E as palavras-chave coincidem ≥ 60%,
  // considera duplicado e descarta a próxima pergunta
  if (replyEndsInQuestion && normReplyQ.length > 0) {
    const replyWords = new Set(normReplyQ.split(" ").filter((w) => w.length > 3));
    const nextWords = normNext.split(" ").filter((w) => w.length > 3);
    if (nextWords.length === 0) return r;
    const overlap =
      nextWords.filter((w) => replyWords.has(w)).length / nextWords.length;
    if (overlap >= 0.5) {
      // Duplicação detectada — usa só o reply (que já tem a pergunta)
      return r;
    }
  }

  return `${r}\n\n${q}`;
}

export default function ComecePage() {
  const router = useRouter();
  const onboardingComplete = useCouple((s) => s.onboarding_complete);
  const partner_1_name = useCouple((s) => s.partner_1_name);
  const partner_2_name = useCouple((s) => s.partner_2_name);
  const wedding_date = useCouple((s) => s.wedding_date);
  const city = useCouple((s) => s.city);
  const state = useCouple((s) => s.state);
  const estimated_budget = useCouple((s) => s.estimated_budget);
  const guest_count = useCouple((s) => s.guest_count);
  const email = useCouple((s) => s.email);
  const onboarding_history = useCouple((s) => s.onboarding_history);
  const applyOnboardingUpdates = useCouple((s) => s.applyOnboardingUpdates);
  const appendChatTurn = useCouple((s) => s.appendChatTurn);

  // Local UI state — espelha o histórico do store + estado de envio
  const [hydrated, setHydrated] = useState(false);
  const [turns, setTurns] = useState<LocalTurn[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transitionReady, setTransitionReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

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

  // Redireciona se onboarding já completo
  useEffect(() => {
    if (hydrated && onboardingComplete) {
      router.replace("/comece/sonho");
    }
  }, [hydrated, onboardingComplete, router]);

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
    partner_1_name: partner_1_name ?? undefined,
    partner_2_name: partner_2_name ?? undefined,
    wedding_date: wedding_date ?? undefined,
    city: city ?? undefined,
    state: state ?? undefined,
    estimated_budget: estimated_budget ?? undefined,
    guest_count: guest_count ?? undefined,
    email: email ?? undefined,
  };
  const collectedCount = [
    partner_1_name && partner_2_name,
    wedding_date,
    city,
    estimated_budget,
    guest_count,
    email,
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
          data.needs_clarification,
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

        // Se a transição final chegou, mostra o botão grande de ir ao sonho
        if (data.next_field_to_ask === null) {
          setTransitionReady(true);
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

  // Botão "Topamos" — envia primeira mensagem hidden e dispara primeira call
  function handleStart() {
    setHasStarted(true);
    sendMessage("Topamos");
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

  return (
    <main className="min-h-dvh flex flex-col bg-background">
      {/* Header com logo + barra de progresso */}
      <header className="fixed top-0 left-0 right-0 z-30 safe-top bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <Logo className="text-base md:text-lg" />
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
        </div>
      </header>

      {/* Conversa */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto pt-20 md:pt-24 pb-40 md:pb-32 safe-px"
      >
        <div className="max-w-2xl mx-auto px-4 md:px-0 flex flex-col gap-4 md:gap-5">
          {/* Saudação fixa inicial */}
          <ChatBubble role="assistant">{GREETING}</ChatBubble>

          {!hasStarted && (
            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center justify-center min-h-12 px-7 py-3 rounded-sm bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-brand-wine transition-colors duration-200"
              >
                Topamos
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

          {/* CTA final pra ir ao sonho */}
          {transitionReady && !isLoading && (
            <div className="flex justify-start mt-2">
              <button
                type="button"
                onClick={() => {
                  useCouple.getState().markOnboardingComplete();
                  router.push("/comece/sonho");
                }}
                className="inline-flex items-center justify-center min-h-14 px-8 py-4 rounded-sm bg-primary text-primary-foreground text-base font-medium tracking-wide hover:bg-brand-wine transition-colors duration-200"
              >
                Contar nosso sonho →
              </button>
            </div>
          )}

          <div ref={scrollAnchorRef} />
        </div>
      </div>

      {/* Input — fixed bottom no mobile, inline em desktop */}
      {hasStarted && !transitionReady && (
        <form
          onSubmit={handleSubmit}
          className="fixed bottom-0 left-0 right-0 z-30 safe-bottom safe-px bg-background border-t border-border md:relative md:border-t-0 md:bg-transparent md:safe-bottom-0"
        >
          <div className="max-w-2xl mx-auto px-4 md:px-0 py-3 md:py-6 flex items-end gap-2">
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
              placeholder="Respondam como preferirem..."
              enterKeyHint="send"
              autoComplete="off"
              disabled={isLoading}
              className="flex-1 resize-none rounded-sm border border-border bg-background px-4 py-3 text-base font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 max-h-32 leading-relaxed"
              style={{ fontSize: "16px" }}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="shrink-0 inline-flex items-center justify-center min-w-12 min-h-12 rounded-sm bg-primary text-primary-foreground hover:bg-brand-wine transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none"
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
          </div>
        </form>
      )}
    </main>
  );
}
