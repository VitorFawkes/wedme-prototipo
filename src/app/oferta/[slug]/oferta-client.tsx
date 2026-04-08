"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Check, X as XIcon } from "lucide-react";
import { BackLink } from "@/components/layout/back-link";
import { CoupleNavbar } from "@/components/layout/couple-navbar";
import {
  TriggerRenderer,
  useInlineTriggers,
} from "@/components/triggers/trigger-renderer";
import { TriggerInlineCard } from "@/components/triggers/trigger-inline-card";
import { SpecialistWidget } from "@/components/specialist/specialist-widget";
import { Lightbox } from "@/components/oferta/lightbox";
import { ServiceSelectionUI } from "@/components/oferta/service-selection-ui";
import { Badge } from "@/components/ui/badge";
import { Overline } from "@/components/ornaments/overline";
import { useCouple } from "@/store/couple";
import { getVendorOrVenueBySlug } from "@/lib/couple-helpers";
import { formatBRL, formatDateExtended } from "@/lib/format";
import { categories } from "@/data/categories";
import { CATEGORY_SERVICES } from "@/data/services";
import { cn } from "@/lib/utils";
import type { Vendor } from "@/types";

export function OfertaClient({ slug }: { slug: string }) {
  const router = useRouter();
  const wedding_date = useCouple((s) => s.wedding_date);
  const addSelection = useCouple((s) => s.addSelection);
  const selections = useCouple((s) => s.selections);

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [confirmingPackage, setConfirmingPackage] = useState(false);

  const { triggers: inlineTriggers, dismiss: dismissTrigger } =
    useInlineTriggers();

  useEffect(() => {
    setHydrated(true);
    const v = getVendorOrVenueBySlug(slug);
    if (v) setVendor(v);
  }, [slug]);

  if (!vendor) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <p className="text-muted-foreground">Carregando…</p>
      </main>
    );
  }

  const category = categories.find((c) => c.slug === vendor.category);
  const minPrice = Math.min(...vendor.packages.map((p) => p.price));
  const isAvailable =
    !wedding_date ||
    !vendor.unavailable_dates.some((d) => wedding_date.startsWith(d));
  const existingSelection = selections.find(
    (s) => s.category_slug === vendor.category,
  );
  const allImages = [vendor.cover, ...vendor.portfolio];

  function handleSelectPackage(packageId: string) {
    if (!vendor) return;
    const pkg = vendor.packages.find((p) => p.id === packageId);
    if (!pkg) return;

    setConfirmingPackage(true);
    addSelection({
      category_slug: vendor.category,
      vendor_slug: vendor.slug,
      package_id: pkg.id,
      quoted_price: pkg.price,
      selected_at: new Date().toISOString(),
    });

    setTimeout(() => {
      router.push("/planejamento");
    }, 1200);
  }

  return (
    <>
      <CoupleNavbar />
      <TriggerRenderer />

      <main className="min-h-dvh pt-couple pb-32 md:pb-16 safe-px">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
          {/* Voltar para a listagem da categoria */}
          <BackLink
            href={`/planejamento/${vendor.category}`}
            label={`Voltar para ${category?.name ?? "categorias"}`}
            className="mb-5"
          />

          {/* Inline triggers (match-perfil etc) */}
          {hydrated && inlineTriggers.length > 0 && (
            <div className="mb-6 md:mb-8 space-y-4">
              {inlineTriggers.map((t) => (
                <TriggerInlineCard
                  key={t.rule.slug}
                  trigger={t}
                  onDismiss={() => dismissTrigger(t.rule.slug)}
                />
              ))}
            </div>
          )}

          {/* Galeria hero */}
          <div className="space-y-2 md:space-y-3 mb-8 md:mb-12">
            <button
              type="button"
              onClick={() => {
                setLightboxIndex(0);
                setLightboxOpen(true);
              }}
              className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-md overflow-hidden bg-muted block group"
              aria-label="Abrir galeria"
            >
              <Image
                src={vendor.cover}
                alt={`${vendor.name}, capa principal`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </button>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {vendor.portfolio.slice(0, 4).map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => {
                    setLightboxIndex(i + 1);
                    setLightboxOpen(true);
                  }}
                  className="relative aspect-square rounded-sm overflow-hidden bg-muted group"
                  aria-label={`Foto ${i + 2}`}
                >
                  <Image
                    src={img}
                    alt={`${vendor.name}, foto ${i + 2}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Identidade + card lateral (desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mb-12 md:mb-16">
            <div className="lg:col-span-2">
              <Overline className="mb-3">{category?.name ?? ""}</Overline>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-foreground tracking-editorial leading-[1.1] mb-4">
                {vendor.name}
              </h1>
              <p className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground mb-6">
                <span>
                  {vendor.city}
                  {vendor.state ? `, ${vendor.state}` : ""}
                </span>
                {vendor.verified && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Check className="size-3.5 text-primary" /> Verificado
                    </span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3.5 fill-foreground text-foreground" />
                  <strong className="text-foreground">{vendor.rating}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>{vendor.total_reviews} casamentos</span>
              </p>

              <div className="h-px bg-border my-6" />

              <div className="space-y-4 text-base text-foreground leading-relaxed font-sans">
                {vendor.bio.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
                CNPJ 00.000.000/0001-00
              </p>

              {vendor.highlights && vendor.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {vendor.highlights.slice(0, 4).map((h) => (
                    <Badge key={h} variant="muted">
                      {h}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Card lateral desktop / bottom sheet mobile */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 bg-card border border-border rounded-md p-6 shadow-sm">
                <Overline className="mb-2">Disponibilidade</Overline>
                {hydrated && wedding_date ? (
                  <p
                    className={cn(
                      "text-sm font-medium leading-snug",
                      isAvailable
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {isAvailable ? "✓ Disponível" : "Indisponível"} para{" "}
                    {formatDateExtended(wedding_date)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Defina a data no onboarding pra checar disponibilidade.
                  </p>
                )}

                <div className="h-px bg-border my-5" />

                <Overline className="mb-2">A partir de</Overline>
                <p className="font-display text-3xl md:text-4xl text-foreground tracking-editorial mb-5">
                  {formatBRL(minPrice)}
                </p>

                <a
                  href="#servicos"
                  className="inline-flex items-center justify-center w-full min-h-12 px-5 rounded-sm bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-brand-wine transition-colors"
                >
                  Ver serviços →
                </a>
              </div>
            </aside>
          </div>

          {/* Pacotes */}
          <section id="pacotes" className="mb-12 md:mb-16 scroll-mt-20">
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground tracking-editorial mb-6 md:mb-8">
              Pacotes disponíveis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {vendor.packages.map((pkg) => {
                const isSelected = selectedPackage === pkg.id;
                return (
                  <article
                    key={pkg.id}
                    className={cn(
                      "rounded-md border p-6 md:p-7 flex flex-col bg-card transition-colors",
                      isSelected
                        ? "border-primary ring-1 ring-primary"
                        : "border-border",
                    )}
                  >
                    <h3 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-editorial mb-2">
                      {pkg.name}
                    </h3>
                    <p className="font-display text-3xl md:text-4xl text-primary tracking-editorial mb-1">
                      {formatBRL(pkg.price)}
                    </p>
                    <Overline className="mb-5">Valor de referência</Overline>

                    <ul className="space-y-2.5 mb-6 flex-1">
                      {pkg.includes.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-sm text-foreground leading-relaxed"
                        >
                          <Check className="size-4 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {pkg.excludes.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed"
                        >
                          <XIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPackage(pkg.id);
                        handleSelectPackage(pkg.id);
                      }}
                      disabled={confirmingPackage}
                      className="inline-flex items-center justify-center w-full min-h-12 px-5 rounded-sm bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-brand-wine transition-colors disabled:opacity-50"
                    >
                      {confirmingPackage && isSelected
                        ? "Salvando…"
                        : existingSelection?.package_id === pkg.id
                          ? "✓ Pacote escolhido"
                          : "Quero este pacote →"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Serviços individuais (novo sistema) */}
          {vendor && (
            <section id="servicos" className="mb-12 md:mb-16 scroll-mt-20">
              <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground tracking-editorial mb-6 md:mb-8">
                Monte sua seleção
              </h2>
              {(() => {
                const catServices = CATEGORY_SERVICES[vendor.category];
                if (!catServices) return null;
                return (
                  <ServiceSelectionUI
                    vendorSlug={vendor.slug}
                    categorySlug={vendor.category}
                    services={vendor.services ?? catServices.services}
                    bringYourOwn={vendor.bring_your_own ?? catServices.bring_your_own}
                    faq={vendor.faq ?? catServices.faq}
                    colorPalettes={vendor.color_palettes ?? catServices.color_palettes}
                  />
                );
              })()}
            </section>
          )}

          {/* Galeria de trabalhos */}
          <section className="bg-muted -mx-4 md:-mx-8 px-4 md:px-8 py-12 md:py-16 mb-12 md:mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground tracking-editorial mb-6 md:mb-8 text-center">
              Trabalhos realizados
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 max-w-5xl mx-auto">
              {vendor.portfolio.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => {
                    setLightboxIndex(i + 1);
                    setLightboxOpen(true);
                  }}
                  className="relative aspect-square rounded-sm overflow-hidden bg-background group"
                  aria-label={`Foto ${i + 1} de ${vendor.portfolio.length}`}
                >
                  <Image
                    src={img}
                    alt={`${vendor.name}, trabalho ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </section>

          {/* Reviews */}
          {vendor.reviews.length > 0 && (
            <section>
              <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground tracking-editorial mb-6 md:mb-8">
                O que os casais disseram
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                {vendor.reviews.map((review) => (
                  <article
                    key={review.couple_name}
                    className="bg-card border border-border rounded-md p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground font-display text-sm tracking-wide">
                        {review.initials}
                      </div>
                      <div>
                        <p className="font-display text-base text-foreground">
                          {review.couple_name}
                        </p>
                        <Overline className="mt-0.5">
                          {review.city} · {review.date}
                        </Overline>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-3.5",
                            i < review.rating
                              ? "fill-foreground text-foreground"
                              : "text-muted",
                          )}
                        />
                      ))}
                    </div>
                    <p className="font-display italic text-base text-muted-foreground leading-relaxed">
                      &ldquo;{review.quote}&rdquo;
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Bottom bar mobile com preço + CTA */}
      <div className="lg:hidden sticky bottom-0 left-0 right-0 z-30 safe-bottom safe-px bg-card border-t border-border shadow-[0_-4px_20px_rgba(12,1,6,0.08)]">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <Overline>A partir de</Overline>
            <p className="font-display text-xl text-foreground tracking-editorial leading-tight">
              {formatBRL(minPrice)}
            </p>
            {hydrated && wedding_date && (
              <p
                className={cn(
                  "text-xs",
                  isAvailable
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {isAvailable ? "✓ Disponível" : "Indisponível"}
              </p>
            )}
          </div>
          <a
            href="#servicos"
            className="shrink-0 inline-flex items-center justify-center min-h-12 px-5 rounded-sm bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-brand-wine transition-colors"
          >
            Ver serviços →
          </a>
        </div>
      </div>

      <Lightbox
        images={allImages}
        open={lightboxOpen}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        alt={vendor.name}
      />

      <SpecialistWidget />
    </>
  );
}
