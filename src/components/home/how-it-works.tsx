import { Sparkles, Compass, Heart } from "lucide-react";
import { Overline } from "@/components/ornaments/overline";

/**
 * Seção "Como funciona" (briefing §5.1 #2).
 *
 * 3 passos com ícones em círculos bordeaux.
 * Mobile: stack vertical. Desktop: 3 colunas.
 */
const STEPS = [
  {
    Icon: Sparkles,
    title: "Vocês contam o sonho",
    body: "Uma assistente entende como vocês imaginam o casamento, por texto ou por áudio. Sem formulário, sem dropdown infinito.",
  },
  {
    Icon: Compass,
    title: "Nós montamos o caminho",
    body: "A partir do sonho de vocês, a plataforma sabe quais categorias importam, em qual ordem, e quais profissionais fazem sentido. Curadoria de verdade.",
  },
  {
    Icon: Heart,
    title: "Vocês escolhem, a gente executa",
    body: "Comparem, selecionem, confirmem. Tudo online. Dos contratos à comunicação com cada profissional, quem resolve somos nós.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="bg-background py-20 md:py-28 px-6 md:px-12 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <Overline className="mb-4">Como funciona</Overline>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-normal text-foreground tracking-editorial leading-tight">
            Um jeito novo de casar
          </h2>
          <p className="mt-4 md:mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Sem planilhas, sem ligações, sem estresse. Três passos, e acabou.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {STEPS.map((step, i) => {
            const Icon = step.Icon;
            return (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary text-primary-foreground mb-5 md:mb-6">
                  <Icon className="size-6 md:size-7" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl md:text-2xl font-medium text-foreground tracking-editorial mb-3">
                  {step.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs">
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
