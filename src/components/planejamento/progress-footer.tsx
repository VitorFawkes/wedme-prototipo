"use client";

import Link from "next/link";
import { useCouple } from "@/store/couple";
import {
  getCategoriesOfPath,
  getTotalConfirmed,
} from "@/lib/couple-helpers";
import { formatBRL } from "@/lib/format";

/**
 * Rodapé sticky de progresso (briefing §5.4 #4).
 *
 * Aparece em /planejamento quando há ≥1 seleção. Mobile e desktop:
 * - Mobile: stack vertical (contador acima, CTA abaixo full-width)
 * - Desktop: layout horizontal
 *
 * Sempre respeita safe-bottom.
 */
export function ProgressFooter() {
  const selections = useCouple((s) => s.selections);
  const profileSlug = useCouple((s) => s.wedding_profile_slug);

  if (selections.length === 0) return null;

  const total = selections.length;
  const path = getCategoriesOfPath(profileSlug);
  const totalConfirmed = getTotalConfirmed(selections);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 safe-bottom safe-px bg-background border-t border-border shadow-[0_-4px_20px_rgba(12,1,6,0.06)]"
      role="status"
      aria-label="Progresso do planejamento"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <p className="text-xs md:text-sm text-muted-foreground tracking-wide font-sans">
            <span className="font-medium text-foreground">
              {total} de {path.length}
            </span>{" "}
            categorias escolhidas ·{" "}
            <span className="font-medium text-foreground">
              {formatBRL(totalConfirmed)}
            </span>
          </p>
        </div>
        <Link
          href="/meu-casamento"
          className="inline-flex items-center justify-center min-h-12 px-6 md:px-7 rounded-sm bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-brand-wine transition-colors duration-200 w-full sm:w-auto"
        >
          Ir ao meu casamento →
        </Link>
      </div>
    </div>
  );
}
