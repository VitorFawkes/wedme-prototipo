"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { useCouple } from "@/store/couple";

/**
 * Navbar fina das rotas do casal: /planejamento, /meu-casamento, /checkout,
 * /planejamento/[categoria], /oferta/[slug].
 *
 * Layout mobile (h-14): logo | nome do casal (truncado) | botão reset
 * Layout desktop (h-16): logo | nome do casal | "Reiniciar simulação"
 *
 * O botão de reset é visível em todos os tamanhos:
 *  - Mobile: ícone + label "Reiniciar" curto (cabe em 375px)
 *  - Desktop: ícone + "Reiniciar simulação" completo
 */
export function CoupleNavbar() {
  const router = useRouter();
  const partner1 = useCouple((s) => s.partner_1_name);
  const partner2 = useCouple((s) => s.partner_2_name);
  const reset = useCouple((s) => s.reset);

  const coupleName =
    partner1 && partner2 ? `${partner1} & ${partner2}` : "Meu casamento";

  function handleReset() {
    if (
      confirm(
        "Reiniciar a simulação? Todo o progresso será apagado e você volta para o início.",
      )
    ) {
      reset();
      router.push("/");
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 safe-top safe-px bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="flex items-center justify-between h-14 md:h-16 px-4 md:px-8 max-w-7xl mx-auto gap-3">
        <Link
          href="/"
          className="inline-flex items-center min-h-11 -ml-1 px-1 shrink-0"
          aria-label="we.wedme, voltar para a home"
        >
          <Logo className="text-base md:text-xl" />
        </Link>

        {/* Nome do casal: centralizado, truncado se muito longo. */}
        <div
          className="flex-1 min-w-0 text-center max-w-[35vw] md:max-w-none"
          aria-label={`Casamento de ${coupleName}`}
        >
          <span className="font-display text-sm md:text-base text-muted-foreground truncate inline-block max-w-full">
            {coupleName}
          </span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center gap-1.5 md:gap-2 min-h-11 px-3 md:px-4 rounded-sm border border-border text-foreground text-xs md:text-sm font-medium tracking-wide hover:bg-foreground hover:text-background hover:border-foreground transition-colors duration-200 shrink-0"
          aria-label="Reiniciar simulação"
        >
          <RotateCcw className="size-3.5 md:size-4" aria-hidden="true" />
          <span className="md:hidden">Reiniciar</span>
          <span className="hidden md:inline">Reiniciar simulação</span>
        </button>
      </nav>
    </header>
  );
}
