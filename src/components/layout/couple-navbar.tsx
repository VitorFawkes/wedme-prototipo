"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { useCouple } from "@/store/couple";

/**
 * Navbar fina das rotas do casal — /planejamento, /meu-casamento, /checkout,
 * /planejamento/[categoria], /oferta/[slug].
 *
 * Layout mobile (h-12): logo | nome do casal (truncado) | ícone reset
 * Layout desktop (h-14): logo | "Meu casamento" | nome do casal | reset
 */
export function CoupleNavbar() {
  const router = useRouter();
  const partner1 = useCouple((s) => s.partner_1_name);
  const partner2 = useCouple((s) => s.partner_2_name);
  const reset = useCouple((s) => s.reset);

  const coupleName =
    partner1 && partner2 ? `${partner1} & ${partner2}` : "Meu casamento";

  function handleReset() {
    if (confirm("Reiniciar a demo? Todo o progresso será apagado.")) {
      reset();
      router.push("/");
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 safe-top safe-px bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="flex items-center justify-between h-12 md:h-14 px-4 md:px-8 max-w-7xl mx-auto gap-3">
        <Link
          href="/meu-casamento"
          className="inline-flex items-center min-h-11 -ml-1 px-1 shrink-0"
          aria-label="Meu casamento"
        >
          <Logo className="text-base md:text-xl" />
        </Link>

        <div className="flex-1 min-w-0 text-center hidden md:block">
          <span className="font-display text-base text-muted-foreground truncate">
            {coupleName}
          </span>
        </div>

        <span className="font-display text-sm text-muted-foreground truncate flex-1 text-right md:hidden max-w-[40vw]">
          {coupleName}
        </span>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center min-w-11 min-h-11 text-muted-foreground hover:text-foreground transition-colors duration-200 shrink-0"
          aria-label="Reiniciar demo"
        >
          <RotateCcw className="size-4" />
          <span className="hidden lg:inline ml-2 text-xs uppercase tracking-widest">
            Reiniciar
          </span>
        </button>
      </nav>
    </header>
  );
}
