import Link from "next/link";
import { Camera, Globe, Play, Music2 } from "lucide-react";
import { Logo } from "@/components/layout/logo";

const COLUMNS = [
  {
    title: "Sobre",
    links: [
      { label: "Quem somos", href: "/#como-funciona" },
      { label: "Depoimentos", href: "/#depoimentos" },
      { label: "Destinos", href: "/#destinos" },
    ],
  },
  {
    title: "Plataforma",
    links: [
      { label: "Planejar casamento", href: "/comece" },
      { label: "Meu casamento", href: "/meu-casamento" },
      { label: "Contato", href: "/#contato" },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Minha conta", href: "/prototipo" },
      { label: "Perguntas frequentes", href: "/#faq" },
    ],
  },
] as const;

const SOCIALS = [
  { label: "Instagram", icon: Camera, href: "/prototipo" },
  { label: "Facebook", icon: Globe, href: "/prototipo" },
  { label: "YouTube", icon: Play, href: "/prototipo" },
  { label: "TikTok", icon: Music2, href: "/prototipo" },
] as const;

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16 md:py-20 px-6 md:px-12 safe-bottom">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-16">
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

        {/* Social icons */}
        <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
          {SOCIALS.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center text-background/70 hover:text-primary hover:bg-background/20 transition-colors duration-200"
            >
              <s.icon className="w-5 h-5" />
            </Link>
          ))}
        </div>

        <div className="pt-8 border-t border-background/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-background/50 tracking-wide">
            © {new Date().getFullYear()} we.wedme. Todos os direitos reservados.
          </p>
          <p className="text-xs text-background/50 tracking-wide">
            Feito com carinho em Curitiba, Brasil.
          </p>
        </div>
      </div>
    </footer>
  );
}
