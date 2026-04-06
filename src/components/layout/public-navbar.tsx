"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/logo";
import { useCouple } from "@/store/couple";
import { cn } from "@/lib/utils";

/**
 * Navbar pública (home institucional).
 *
 * - Logo à esquerda + um único link à direita
 * - Sem hamburger (briefing tem só 1 link)
 * - safe-top (respeita notch)
 * - Variante "transparent" para hero da home (texto branco sobre foto)
 * - Variante "solid" após scroll
 */
export function PublicNavbar({
  variant = "transparent",
}: {
  variant?: "transparent" | "solid";
}) {
  const onboardingComplete = useCouple((s) => s.onboarding_complete);
  const partner1 = useCouple((s) => s.partner_1_name);

  // hidratação: só mostramos o link "Meu casamento" depois de hidratar
  // pra evitar SSR mismatch
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const showCoupleLink = hydrated && onboardingComplete && partner1;
  const ctaHref = showCoupleLink ? "/meu-casamento" : "/comece";
  const ctaLabel = showCoupleLink ? "Meu casamento" : "Planejar meu casamento";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 safe-top safe-px transition-colors duration-300",
        variant === "transparent" ? "bg-transparent" : "bg-background/95 backdrop-blur-sm border-b border-border",
      )}
    >
      <nav className="flex items-center justify-between h-14 md:h-16 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center min-h-11 -ml-1 px-1"
          aria-label="we.wedme — voltar para a home"
        >
          <Logo variant={variant === "transparent" ? "light" : "default"} />
        </Link>

        <Link
          href={ctaHref}
          className={cn(
            "inline-flex items-center min-h-11 px-4 md:px-5 text-sm font-medium tracking-wide transition-colors duration-200",
            variant === "transparent"
              ? "text-white/90 hover:text-white"
              : "text-foreground hover:text-primary",
          )}
        >
          {ctaLabel}
        </Link>
      </nav>
    </header>
  );
}
