"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Ornament } from "@/components/ornaments/ornament";
import { Overline } from "@/components/ornaments/overline";

/**
 * Error boundary global. Tom acolhedor (briefing §3.5).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-background px-6 md:px-12 text-center safe-px safe-top safe-bottom">
      <Ornament size="lg" className="mb-6" />
      <Overline className="mb-4">Algo inesperado</Overline>
      <h1 className="font-display text-3xl md:text-5xl font-medium text-foreground tracking-editorial leading-tight max-w-xl">
        Algo deu errado.
        <br />
        Vamos tentar de novo?
      </h1>
      <p className="mt-6 text-base text-muted-foreground max-w-md">
        Travamos por um instante aqui. Não foi nada com vocês.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center min-h-12 px-7 rounded-sm bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-brand-wine transition-colors"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-12 px-7 rounded-sm border border-border text-foreground text-sm font-medium tracking-wide hover:border-primary transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
