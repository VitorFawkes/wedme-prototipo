"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Ornament } from "@/components/ornaments/ornament";
import { Overline } from "@/components/ornaments/overline";
import { Divider } from "@/components/ornaments/divider";
import { useCouple } from "@/store/couple";
import {
  getCoupleSlug,
  getVendorOrVenueBySlug,
} from "@/lib/couple-helpers";
import { categories } from "@/data/categories";
import { formatDateExtended } from "@/lib/format";

/**
 * Site editorial do casamento (briefing §5.9).
 *
 * Identidade própria — não usa CoupleNavbar.
 *
 * - Hero 100svh com cover do venue escolhido
 * - Nossa história (dream_text em italic display)
 * - Quem faz parte do nosso dia (grid dos profissionais)
 * - Save the date
 * - Footer sutil
 *
 * Mobile-first OBRIGATÓRIO — esta página é o que vai ser compartilhado
 * por WhatsApp e quase sempre aberto no celular.
 */
export function CasamentoClient({ slug }: { slug: string }) {
  const partner_1_name = useCouple((s) => s.partner_1_name);
  const partner_2_name = useCouple((s) => s.partner_2_name);
  const wedding_date = useCouple((s) => s.wedding_date);
  const city = useCouple((s) => s.city);
  const state = useCouple((s) => s.state);
  const dream_text = useCouple((s) => s.dream_text);
  const selections = useCouple((s) => s.selections);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando…</p>
      </main>
    );
  }

  // Slug check pra mostrar placeholder amigável se URL errada
  const expectedSlug = getCoupleSlug(partner_1_name, partner_2_name);
  if (slug !== expectedSlug || !partner_1_name) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center bg-background px-6 text-center">
        <Ornament size="lg" className="mb-6" />
        <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground tracking-editorial mb-4">
          Site não encontrado
        </h1>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Este site é gerado após o casal completar o checkout.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-12 px-6 rounded-sm bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-brand-wine transition-colors"
        >
          Voltar ao início
        </Link>
      </main>
    );
  }

  // Cover do venue escolhido (categoria local)
  const venueSelection = selections.find((s) => s.category_slug === "local");
  const venue = venueSelection
    ? getVendorOrVenueBySlug(venueSelection.vendor_slug)
    : null;
  const heroImage =
    venue?.cover ??
    "https://welucci.com/wp-content/uploads/2026/01/Capa-principal-Home_11zon-scaled.jpg";

  return (
    <main className="bg-background">
      {/* Hero 100svh */}
      <section className="relative min-h-[100svh] flex items-center justify-center isolate overflow-hidden">
        <Image
          src={heroImage}
          alt={`Local do casamento de ${partner_1_name} e ${partner_2_name}`}
          fill
          priority
          sizes="100vw"
          className="object-cover -z-10"
        />
        <div
          className="absolute inset-0 -z-10 bg-foreground/70"
          aria-hidden="true"
        />

        <div className="relative px-6 md:px-12 py-24 md:py-32 text-center max-w-3xl mx-auto safe-top safe-bottom text-white">
          <Ornament size="md" className="mb-6 md:mb-8" />
          <Overline className="!text-white/70 mb-6 md:mb-8">Casamento</Overline>

          <h1 className="font-display font-medium text-white leading-[0.95] tracking-editorial">
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
              {partner_1_name}
            </span>
            <span className="block text-3xl md:text-5xl my-3 md:my-5 text-[color:var(--brand-rose)]">
              &
            </span>
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
              {partner_2_name}
            </span>
          </h1>

          {wedding_date && (
            <p className="font-display text-lg md:text-2xl text-white/90 mt-8 md:mt-12 tracking-editorial">
              {formatDateExtended(wedding_date)}
            </p>
          )}
          {city && (
            <p className="text-sm md:text-base text-white/70 mt-2 tracking-wide">
              {city}
              {state && `, ${state}`}
            </p>
          )}
        </div>
      </section>

      {/* Nossa história */}
      {dream_text && (
        <section className="py-20 md:py-32 px-6 md:px-12 bg-background">
          <div className="max-w-3xl mx-auto text-center">
            <Divider />
            <Overline className="mb-4 md:mb-6">Nossa história</Overline>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-normal text-foreground tracking-editorial leading-tight mb-8 md:mb-10">
              O que sonhamos
            </h2>
            <blockquote className="font-display italic text-xl sm:text-2xl md:text-3xl text-foreground leading-relaxed max-w-2xl mx-auto">
              &ldquo;{dream_text}&rdquo;
            </blockquote>
          </div>
        </section>
      )}

      {/* Quem faz parte */}
      {selections.length > 0 && (
        <section className="py-20 md:py-32 px-6 md:px-12 bg-muted">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <Overline className="mb-4">Curadoria</Overline>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-normal text-foreground tracking-editorial leading-tight">
                Quem faz parte
                <br />
                do nosso dia
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {selections.map((selection) => {
                const vendor = getVendorOrVenueBySlug(selection.vendor_slug);
                const category = categories.find(
                  (c) => c.slug === selection.category_slug,
                );
                if (!vendor || !category) return null;
                return (
                  <article
                    key={selection.category_slug}
                    className="group bg-card border border-border rounded-md overflow-hidden"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <Image
                        src={vendor.cover}
                        alt={`${vendor.name} — ${category.name}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 md:p-6">
                      <Overline className="mb-1.5">{category.name}</Overline>
                      <p className="font-display text-xl md:text-2xl text-foreground tracking-editorial leading-tight">
                        {vendor.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {vendor.city}
                        {vendor.state && `, ${vendor.state}`}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Save the date */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-background text-center">
        <div className="max-w-2xl mx-auto">
          <Divider />
          <Overline className="mb-4">Save the date</Overline>
          <p className="font-display text-2xl md:text-3xl text-muted-foreground tracking-editorial mb-4">
            Esperamos vocês em
          </p>
          {wedding_date && (
            <p className="font-display text-3xl md:text-5xl text-foreground tracking-editorial leading-tight mb-3">
              {formatDateExtended(wedding_date)}
            </p>
          )}
          {venue && (
            <p className="font-display text-xl md:text-2xl text-muted-foreground tracking-editorial">
              {venue.name}
            </p>
          )}
          {city && (
            <p className="text-sm md:text-base text-muted-foreground mt-2 tracking-wide">
              {city}
              {state && `, ${state}`}
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 px-6 md:px-12 bg-foreground text-background safe-bottom">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-background/70 tracking-wide mb-2">
            Planejado com carinho pela
          </p>
          <Link href="/" className="inline-block">
            <Logo variant="light" className="text-2xl md:text-3xl" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
