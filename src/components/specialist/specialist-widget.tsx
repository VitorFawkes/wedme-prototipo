"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Clock, Minus, GripVertical } from "lucide-react";
import { motion, useMotionValue, type PanInfo } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/ornaments/ornament";
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

const STORAGE_KEY = "specialist-widget:state";
const DRAG_THRESHOLD = 4; // px — acima disso consideramos drag, não click

type PersistedState = {
  x: number;
  y: number;
  minimized: boolean;
};

function loadPersisted(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (
      typeof parsed.x !== "number" ||
      typeof parsed.y !== "number" ||
      typeof parsed.minimized !== "boolean"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function SpecialistWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [bounds, setBounds] = useState<{
    top: number;
    left: number;
    right: number;
    bottom: number;
  } | null>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const didDragRef = useRef(false);
  const partner_1_name = useCouple((s) => s.partner_1_name);

  // Carrega posição e estado persistidos no mount (client-only).
  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted) {
      x.set(persisted.x);
      y.set(persisted.y);
      setMinimized(persisted.minimized);
    }
  }, [x, y]);

  // Calcula limites do drag dentro da viewport, recalcula em resize.
  useEffect(() => {
    function computeBounds() {
      const el = fabRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Posição "home" (bottom-right ou bottom-left) já definida por CSS.
      // Offsets são relativos a essa posição home.
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Estilo posiciona o elemento via classes; usamos o rect atual (sem translate)
      // como origem. Os bounds são quanto o usuário pode arrastar a partir dali.
      const homeLeft = rect.left - x.get();
      const homeTop = rect.top - y.get();
      setBounds({
        left: -homeLeft + 8,
        top: -homeTop + 8,
        right: vw - homeLeft - rect.width - 8,
        bottom: vh - homeTop - rect.height - 8,
      });
    }
    computeBounds();
    window.addEventListener("resize", computeBounds);
    return () => window.removeEventListener("resize", computeBounds);
    // Recalcula também quando minimizado muda (tamanho do elemento muda).
  }, [minimized, x, y]);

  function persist(next: Partial<PersistedState>) {
    if (typeof window === "undefined") return;
    const current: PersistedState = {
      x: x.get(),
      y: y.get(),
      minimized,
      ...next,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      /* ignore quota errors */
    }
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (
      Math.abs(info.offset.x) > DRAG_THRESHOLD ||
      Math.abs(info.offset.y) > DRAG_THRESHOLD
    ) {
      didDragRef.current = true;
    }
    persist({ x: x.get(), y: y.get() });
  }

  function handleFabClick() {
    // Se acabamos de arrastar, ignora o click sintético subsequente.
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    setOpen(true);
  }

  function toggleMinimized(e: React.MouseEvent) {
    e.stopPropagation();
    setMinimized((prev) => {
      const next = !prev;
      persist({ minimized: next });
      return next;
    });
  }

  return (
    <>
      {/* FAB - posicionamento defensivo inicial:
          - Mobile: bottom-left (bottom-24 pra ficar acima de progress footer/sticky CTAs)
          - Desktop: bottom-right clássico
          O usuário pode arrastar pra onde quiser (posição persistida em localStorage)
          e minimizar pra só o ícone. */}
      <motion.div
        ref={fabRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={bounds ?? undefined}
        onDragEnd={handleDragEnd}
        style={{ x, y, touchAction: "none" }}
        className="fixed z-40 safe-bottom bottom-24 left-4 md:bottom-6 md:right-6 md:left-auto"
      >
        <div
          className={`group relative flex items-center rounded-full bg-foreground text-background shadow-lg hover:bg-brand-wine transition-colors duration-200 ${
            minimized ? "size-12" : "min-h-12 pl-2 pr-1"
          }`}
        >
          {/* Handle de drag (só quando expandido) */}
          {!minimized && (
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center size-8 text-background/60 cursor-grab active:cursor-grabbing select-none"
              title="Arrastar"
            >
              <GripVertical className="size-4" />
            </span>
          )}

          {/* Botão principal — abre drawer */}
          <button
            type="button"
            onClick={handleFabClick}
            aria-label="Falar com um especialista"
            className={`inline-flex items-center gap-2 ${
              minimized
                ? "size-12 justify-center rounded-full cursor-grab active:cursor-grabbing"
                : "min-h-12 pr-3"
            }`}
          >
            <MessageCircle className="size-5" aria-hidden="true" />
            {!minimized && (
              <>
                <span
                  aria-hidden="true"
                  className="text-sm font-medium tracking-wide hidden sm:inline"
                >
                  Falar com especialista
                </span>
                <span
                  aria-hidden="true"
                  className="text-sm font-medium tracking-wide sm:hidden"
                >
                  Especialista
                </span>
              </>
            )}
          </button>

          {/* Botão minimizar/expandir */}
          {!minimized && (
            <button
              type="button"
              onClick={toggleMinimized}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Minimizar"
              className="inline-flex items-center justify-center size-8 mr-1 rounded-full text-background/70 hover:text-background hover:bg-background/10 transition-colors"
            >
              <Minus className="size-4" />
            </button>
          )}

          {/* Quando minimizado, botão flutuante pequeno pra expandir de volta */}
          {minimized && (
            <button
              type="button"
              onClick={toggleMinimized}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Expandir"
              className="absolute -top-1 -right-1 inline-flex items-center justify-center size-5 rounded-full bg-background text-foreground border border-foreground/20 shadow-sm hover:scale-110 transition-transform"
            >
              <span aria-hidden="true" className="text-[10px] leading-none font-bold">
                +
              </span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="bg-background">
          <div className="mx-auto w-full max-w-lg safe-bottom">
            <DrawerHeader className="px-6 pt-8 pb-4 text-left">
              <div className="flex items-center gap-4 mb-2">
                <div className="relative flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground font-display text-base font-medium shrink-0">
                  IB
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

            <div className="px-6 pb-8">
              <div className="bg-muted rounded-md rounded-bl-[2px] px-4 py-3 max-w-[85%] mb-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Oi{partner_1_name ? `, ${partner_1_name}` : ""}! Sou a
                  Isabela, sua especialista dedicada. Me conta em que
                  posso ajudar. Posso tirar dúvidas sobre locais, datas,
                  contratos, orçamento. O que precisarem. 🤍
                </p>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-md p-5 text-center mb-5">
                <Ornament size="sm" className="mb-3" />
                <p className="font-display text-lg text-foreground tracking-editorial mb-2">
                  Esta é uma simulação
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Na versão final, este botão abre uma conversa direta pelo WhatsApp com a Isabela, sua especialista dedicada.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Entendi
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
