import Link from "next/link";
import { Ornament } from "@/components/ornaments/ornament";
import { Overline } from "@/components/ornaments/overline";

/**
 * 404 acolhedor.
 */
export default function NotFound() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-background px-6 md:px-12 text-center safe-px safe-top safe-bottom">
      <Ornament size="lg" className="mb-6" />
      <Overline className="mb-4">Página não encontrada</Overline>
      <h1 className="font-display text-3xl md:text-5xl font-medium text-foreground tracking-editorial leading-tight max-w-xl">
        Esta página não existe.
      </h1>
      <p className="mt-6 text-base text-muted-foreground max-w-md">
        Pode ter sido removida ou o link estava errado. Voltem pro início que a
        gente recomeça.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center min-h-12 px-7 mt-10 rounded-sm bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-brand-wine transition-colors"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
