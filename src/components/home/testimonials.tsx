import { Star } from "lucide-react";
import { homeTestimonials } from "@/data/home";
import { Overline } from "@/components/ornaments/overline";

/**
 * Depoimentos da home (briefing §5.1 #5).
 *
 * Mobile: stack vertical (1 col). Desktop: 3 colunas.
 */
export function Testimonials() {
  return (
    <section
      id="depoimentos"
      className="bg-muted py-20 md:py-28 px-6 md:px-12 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <Overline className="mb-4">Depoimentos</Overline>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-normal text-foreground tracking-editorial leading-tight">
            Casais que já celebraram
            <br />
            com a gente
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {homeTestimonials.map((t) => (
            <article
              key={t.coupleName}
              className="bg-card border border-border rounded-md p-6 md:p-8 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center justify-center size-14 rounded-full bg-primary text-primary-foreground font-display text-base font-medium tracking-wide">
                  {t.initials}
                </div>
                <div>
                  <p className="font-display text-lg text-foreground tracking-editorial">
                    {t.coupleName}
                  </p>
                  <Overline className="mt-0.5">
                    {t.city} · {t.date}
                  </Overline>
                </div>
              </div>
              <blockquote className="font-display italic text-lg md:text-xl text-foreground leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex gap-1 mt-5" aria-label="5 estrelas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-primary text-primary"
                    aria-hidden="true"
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
