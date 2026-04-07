"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Ornament } from "@/components/ornaments/ornament";
import { Overline } from "@/components/ornaments/overline";

/**
 * Tela de celebração pós-confirmação (briefing §5.8 #2).
 *
 * - Confete sutil (max 15 peças, transform/opacity only)
 * - Honra prefers-reduced-motion
 * - Ornamento + display gigante
 * - Dois CTAs: ver site / voltar ao início
 */

const CONFETTI_COLORS = [
  "var(--color-primary)",
  "var(--color-brand-rose)",
  "var(--color-brand-wine)",
  "var(--color-foreground)",
];

export function CelebrationScreen({ slug }: { slug: string }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  return (
    <main className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 md:px-12 py-16 md:py-24 text-center safe-px safe-top safe-bottom relative overflow-hidden">
      {!reduced && <ConfettiPieces />}

      <Ornament size="xl" className="mb-6 md:mb-8" />

      <Overline className="mb-4 md:mb-6">Parabéns</Overline>

      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground tracking-editorial leading-[1.05] max-w-3xl">
        O casamento de vocês
        <br />
        está confirmado <span aria-hidden>🎉</span>
      </h1>

      <p className="font-display italic text-lg md:text-2xl text-muted-foreground mt-6 md:mt-8 max-w-xl leading-relaxed">
        Vocês acabam de dar o primeiro passo do início de tudo.
      </p>

      <div className="mt-12 md:mt-16 flex flex-col items-center gap-3">
        <Link
          href={`/casamento/${slug}`}
          className="inline-flex items-center justify-center min-h-14 px-8 md:px-10 py-4 rounded-sm bg-primary text-primary-foreground text-base md:text-lg font-medium tracking-wide hover:bg-brand-wine transition-colors duration-200"
        >
          Ver nosso site de casamento →
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-11 px-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}

function ConfettiPieces() {
  // Distribuição aleatória mas determinística por render
  const pieces = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 3 + Math.random() * 1.5,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotate: Math.random() * 360,
    size: 6 + Math.random() * 6,
  }));

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, opacity: 0, rotate: p.rotate }}
          animate={{
            y: "110vh",
            opacity: [0, 1, 1, 0],
            rotate: p.rotate + 360,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          className="absolute top-0 rounded-sm"
        />
      ))}
    </div>
  );
}
