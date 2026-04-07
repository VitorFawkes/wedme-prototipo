"use client";

import { useState } from "react";
import { MessageCircle, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/ornaments/ornament";
import { Overline } from "@/components/ornaments/overline";
import { useCouple } from "@/store/couple";

/**
 * Widget "Falar com especialista" — FAB discreto fixed bottom-right.
 *
 * Padrão copiado de Aman/Net-a-Porter/Joy: sempre visível mas nunca atrapalha.
 * Em rotas com progress footer, posicionado acima dele.
 *
 * Mobile: FAB bottom-right (acima do progress footer) → abre bottom sheet
 * Desktop: mesma coisa mas com tooltip de contexto
 *
 * Ao abrir, mostra um drawer com:
 * - Nome do "especialista" dedicado (mock)
 * - Horário de atendimento
 * - 4 perguntas rápidas pré-formatadas (one-tap)
 * - Campo livre
 * - CTA "Enviar" (mock, só mostra confirmação)
 */

const QUICK_QUESTIONS = [
  "Quero ajuda pra escolher o local",
  "Qual a melhor data pra minha cidade?",
  "Como funciona o pagamento?",
  "Posso trocar um profissional depois?",
] as const;

export function SpecialistWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const partner_1_name = useCouple((s) => s.partner_1_name);

  function handleSend() {
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => {
      setOpen(false);
      setTimeout(() => {
        setSent(false);
        setMessage("");
      }, 400);
    }, 2200);
  }

  function pickQuick(q: string) {
    setMessage(q);
  }

  return (
    <>
      {/* FAB */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="fixed z-20 safe-bottom bottom-20 right-4 md:bottom-6 md:right-6"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Falar com um especialista"
          className="group inline-flex items-center gap-2 min-h-12 pl-4 pr-5 rounded-full bg-foreground text-background shadow-lg hover:bg-brand-wine transition-all duration-200 hover:pr-6"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          <span className="text-sm font-medium tracking-wide hidden sm:inline">
            Falar com especialista
          </span>
          <span className="text-sm font-medium tracking-wide sm:hidden">
            Especialista
          </span>
        </button>
      </motion.div>

      {/* Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="bg-background">
          <div className="mx-auto w-full max-w-lg safe-bottom">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="py-16 px-6 text-center"
                >
                  <Ornament size="lg" className="mb-4" />
                  <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-editorial">
                    Mensagem recebida
                  </h2>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-sm mx-auto">
                    Isabela vai responder em alguns minutos. Vocês vão receber
                    pelo email cadastrado.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <DrawerHeader className="px-6 pt-8 pb-4 text-left">
                    <div className="flex items-center gap-4 mb-2">
                      {/* Avatar do especialista */}
                      <div className="relative flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground font-display text-base font-medium shrink-0">
                        IB
                        {/* Indicador online */}
                        <span
                          className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 border-2 border-background"
                          aria-label="Online"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <DrawerTitle className="font-display text-xl md:text-2xl font-medium tracking-editorial leading-tight text-left">
                          Isabela Bressan
                        </DrawerTitle>
                        <DrawerDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Clock className="size-3" />
                          Especialista · Online agora
                        </DrawerDescription>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Fechar"
                        className="inline-flex items-center justify-center min-w-11 min-h-11 text-muted-foreground hover:text-foreground transition-colors -mr-2"
                      >
                        <X className="size-5" />
                      </button>
                    </div>
                  </DrawerHeader>

                  <div className="px-6 pb-6">
                    {/* Mensagem de boas-vindas */}
                    <div className="bg-muted rounded-md rounded-bl-[2px] px-4 py-3 max-w-[85%] mb-5">
                      <p className="text-sm text-foreground leading-relaxed">
                        Oi{partner_1_name ? `, ${partner_1_name}` : ""}! Sou a
                        Isabela, sua especialista dedicada. Me conta em que
                        posso ajudar — posso tirar dúvidas sobre locais, datas,
                        contratos, orçamento. O que precisarem. 🤍
                      </p>
                    </div>

                    {/* Perguntas rápidas */}
                    <Overline className="mb-2">Perguntas comuns</Overline>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {QUICK_QUESTIONS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => pickQuick(q)}
                          className="text-xs md:text-sm px-3 py-2 rounded-sm bg-background border border-border hover:border-primary hover:text-primary transition-colors leading-tight min-h-9 text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </div>

                    {/* Campo de mensagem */}
                    <label htmlFor="specialist-msg" className="sr-only">
                      Sua mensagem
                    </label>
                    <textarea
                      id="specialist-msg"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escreva sua dúvida..."
                      rows={3}
                      className="w-full rounded-sm border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary leading-relaxed resize-none mb-4"
                      style={{ fontSize: "16px" }}
                    />

                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      className="w-full"
                      onClick={handleSend}
                      disabled={!message.trim()}
                    >
                      Enviar mensagem
                    </Button>

                    <p className="text-xs text-muted-foreground text-center mt-3 tracking-wide">
                      Resposta em até 5 minutos no horário comercial
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
