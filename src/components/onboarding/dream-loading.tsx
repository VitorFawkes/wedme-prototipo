"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ornament } from "@/components/ornaments/ornament";

/**
 * Loading cinematográfico do `/comece/sonho` (briefing §5.3).
 *
 * - Tela limpa creme
 * - Ornamento ◇ pulsante grande
 * - Texto display "Estamos lendo o sonho de vocês"
 * - Sub-texto que troca a cada 1.2s com crossfade
 * - Sem barra de progresso (suspense controlado)
 */

const STEPS = [
  "Ouvindo o que vocês escreveram.",
  "Separando o que importa de verdade.",
  "Identificando o estilo de casamento.",
  "Escolhendo os profissionais certos para o perfil.",
  "Montando o caminho.",
] as const;

export function DreamLoading() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % STEPS.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6 safe-px"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full bg-[color:var(--brand-rose)]/10 mb-10 md:mb-12">
        <Ornament size="xl" pulse className="!text-5xl md:!text-6xl" />
      </div>

      <h2 className="font-display text-3xl md:text-5xl font-medium text-foreground text-center max-w-lg leading-tight tracking-editorial">
        Estamos lendo o sonho de vocês
      </h2>

      <div className="mt-8 md:mt-10 h-6 relative w-full max-w-md text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 text-sm md:text-base text-muted-foreground tracking-wide font-sans"
          >
            {STEPS[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
