"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/**
 * Botão "Voltar" consistente. Aceita um destino expl\u00edcito (`href`) ou
 * um label customizado. Sempre renderizado como link/button discreto,
 * com m\u00ednimo touch target de 44px e tipografia editorial.
 *
 * Comportamento:
 * - Se `href` for passado, age como Link normal (boa pr\u00e1tica: previs\u00edvel)
 * - Se n\u00e3o, usa router.back() (history navigation)
 *
 * O componente \u00e9 "use client" porque usa useRouter, mas pode ser
 * importado em qualquer p\u00e1gina (Server ou Client).
 */
export function BackLink({
  href,
  label = "Voltar",
  className = "",
}: {
  href?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const baseClasses =
    "inline-flex items-center min-h-11 -ml-2 pl-1 pr-3 text-sm text-muted-foreground hover:text-foreground transition-colors";

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${className}`}>
        <ChevronLeft className="size-4 mr-1" aria-hidden="true" />
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`${baseClasses} ${className}`}
    >
      <ChevronLeft className="size-4 mr-1" aria-hidden="true" />
      {label}
    </button>
  );
}
