"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Overline } from "@/components/ornaments/overline";
import { Badge } from "@/components/ui/badge";
import { venues } from "@/data/venues";

/**
 * Grid de venues (briefing §5.1 #4).
 *
 * Mostra 4 venues iniciais em mobile (1 col) e 6 em desktop (3 col).
 * Botão "Ver todos" expande para os 13.
 *
 * Cards editoriais com hover scale na imagem.
 */
export function VenuesGrid() {
  const [expanded, setExpanded] = useState(false);

  // Ordena pelos tier 1 primeiro, depois 2, depois 3
  const sorted = [...venues].sort((a, b) => (a.tier ?? 9) - (b.tier ?? 9));

  // Mobile mostra 4 inicialmente, desktop mostra 6
  const visible = expanded ? sorted : sorted.slice(0, 6);

  return (
    <section
      id="venues"
      className="bg-background py-20 md:py-28 px-4 md:px-12 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <Overline className="mb-4">Locais parceiros</Overline>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-normal text-foreground tracking-editorial leading-tight">
            {venues.length} espaços Welucci
            <br />
            para o grande dia
          </h2>
          <p className="mt-4 md:mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Dos cartões-postais de São Paulo à beira-mar no Guarujá.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {visible.map((venue) => (
            <Link
              key={venue.slug}
              href={`/oferta/${venue.slug}`}
              className="group block focus-visible:outline-none rounded-md overflow-hidden bg-card border border-border transition-shadow duration-300 hover:shadow-lg active:scale-[0.99]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image
                  src={venue.cover}
                  alt={`${venue.name}, ${venue.tagline}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5 md:p-6">
                <Overline className="mb-2">
                  {venue.city}, {venue.state}
                </Overline>
                <h3 className="font-display text-2xl font-medium text-foreground tracking-editorial leading-tight mb-2">
                  {venue.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {venue.tagline}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {venue.highlights?.slice(0, 2).map((h) => (
                    <Badge key={h} variant="muted">
                      {h}
                    </Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!expanded && venues.length > 6 && (
          <div className="text-center mt-12">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex items-center justify-center min-h-12 px-7 py-3.5 rounded-sm border border-primary text-primary text-sm font-medium tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
            >
              Ver todos os {venues.length} espaços →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
