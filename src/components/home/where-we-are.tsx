import { MapPin } from "lucide-react";

export function WhereWeAre() {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 relative overflow-hidden">
      {/* Watermark "W" */}
      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 font-display text-foreground/[0.04] select-none pointer-events-none"
        style={{ fontSize: "clamp(250px, 40vw, 600px)", lineHeight: 1 }}
        aria-hidden="true"
      >
        W
      </div>

      <div className="max-w-3xl mx-auto relative">
        <p className="text-xs font-sans tracking-widest text-primary uppercase mb-6 text-center md:text-left">
          Onde Estamos
        </p>

        <h2 className="font-display font-medium text-3xl md:text-4xl lg:text-5xl tracking-editorial leading-tight text-center md:text-left">
          Venha nos visitar
        </h2>

        <div className="mt-8 md:mt-10 flex items-start gap-4">
          <div className="flex-none w-10 h-10 rounded-sm bg-accent flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-base md:text-lg text-foreground leading-relaxed">
              Rua Acyr Guimarães, 222, 4° andar
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Água Verde, Curitiba, PR, 80240-230
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
