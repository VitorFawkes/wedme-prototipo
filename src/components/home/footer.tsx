import Link from "next/link";
import { Logo } from "@/components/layout/logo";

/**
 * Footer da home (briefing §5.1 #7).
 *
 * bg-foreground text-background. Mobile: stack. Desktop: 3 colunas.
 */

/**
 * Colunas do footer. Os links abaixo apontam para âncoras dentro da home,
 * que existem de fato (cada seção tem id próprio). Mantemos apenas
 * navegação real — links institucionais "Sobre/Imprensa/etc" foram
 * removidos porque ainda não têm destino e parar em # é decepção.
 */
const COLUMNS = [
  {
    title: "Plataforma",
    links: [
      { label: "Como funciona", href: "/#como-funciona" },
      { label: "Espaços parceiros", href: "/#venues" },
      { label: "Depoimentos", href: "/#depoimentos" },
      { label: "Perguntas frequentes", href: "/#faq" },
    ],
  },
  {
    title: "Para casais",
    links: [
      { label: "Planejar meu casamento", href: "/comece" },
      { label: "Meu casamento", href: "/meu-casamento" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16 md:py-20 px-6 md:px-12 safe-bottom">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 mb-12 md:mb-16">
          <div>
            <Logo variant="light" className="text-2xl mb-4" />
            <p className="text-sm text-background/70 leading-relaxed max-w-xs">
              Curadoria de casamentos para casais que querem celebrar sem
              renunciar ao essencial.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-display text-base text-background mb-4">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center min-h-11 text-sm text-background/70 hover:text-background transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-background/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-background/50 tracking-wide">
            © {new Date().getFullYear()} we.wedme. Todos os direitos reservados.
          </p>
          <p className="text-xs text-background/50 tracking-wide">
            Feito com carinho em São Paulo, Brasil.
          </p>
        </div>
      </div>
    </footer>
  );
}
