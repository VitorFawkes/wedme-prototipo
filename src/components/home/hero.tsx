import Image from "next/image";
import Link from "next/link";
import { Overline } from "@/components/ornaments/overline";

/**
 * Hero da home (briefing §5.1).
 *
 * - min-h-[100svh] (não vh — iOS Safari quebra)
 * - Imagem real Welucci Estaiada
 * - Overlay escuro 60% sobre foto
 * - Conteúdo centralizado em branco
 * - Mobile: padding generoso, título responsivo
 */
export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center isolate overflow-hidden">
      <Image
        src="https://welucci.com/wp-content/uploads/2026/01/Capa-principal-Home_11zon-scaled.jpg"
        alt="Welucci Estaiada — vista para a Ponte Estaiada de São Paulo"
        fill
        priority
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className="object-cover -z-10"
      />
      <div
        className="absolute inset-0 -z-10 overlay-dark-60"
        aria-hidden="true"
      />

      <div className="relative px-6 md:px-12 py-24 md:py-32 text-center max-w-3xl mx-auto safe-top">
        <Overline className="text-white/70 mb-6 md:mb-8">
          Curadoria de casamentos
        </Overline>

        <h1 className="font-display font-medium text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-editorial">
          Seu casamento
          <br />
          dos sonhos,
          <br />
          do início ao fim
        </h1>

        <p className="mt-6 md:mt-8 text-base md:text-lg text-white/85 font-sans leading-relaxed max-w-md mx-auto">
          A gente cuida dos profissionais. Vocês cuidam do sonho.
        </p>

        <div className="mt-8 md:mt-10">
          <Link
            href="/comece"
            className="inline-flex items-center justify-center min-h-12 px-8 py-4 rounded-sm bg-primary text-primary-foreground text-sm md:text-base font-medium tracking-wide hover:bg-brand-wine transition-colors duration-200"
          >
            Planejar meu casamento
          </Link>
        </div>

        <p className="mt-6 text-xs md:text-sm text-white/60 tracking-wide">
          Três minutos e a jornada de vocês começa.
        </p>
      </div>
    </section>
  );
}
