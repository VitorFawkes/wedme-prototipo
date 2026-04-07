import { Overline } from "@/components/ornaments/overline";
import { homeNumbers } from "@/data/home";

/**
 * Seção de números (briefing §5.1 #3) — bg-muted, py-20.
 *
 * Mobile: stack vertical. sm:+ : 2 colunas. lg:+ : 4 colunas.
 */
export function Numbers() {
  return (
    <section className="bg-muted py-16 md:py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 text-center">
        {homeNumbers.map((n) => (
          <div key={n.label}>
            <p className="font-display text-5xl md:text-6xl lg:text-7xl font-medium text-foreground leading-none tracking-editorial">
              {n.value}
            </p>
            <Overline className="mt-3 md:mt-4">{n.label}</Overline>
          </div>
        ))}
      </div>
    </section>
  );
}
