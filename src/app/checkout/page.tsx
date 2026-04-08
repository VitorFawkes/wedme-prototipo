"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { BackLink } from "@/components/layout/back-link";
import { CoupleNavbar } from "@/components/layout/couple-navbar";
import { Overline } from "@/components/ornaments/overline";
import { Ornament } from "@/components/ornaments/ornament";
import { CelebrationScreen } from "@/components/checkout/celebration";
import { SpecialistWidget } from "@/components/specialist/specialist-widget";
import { BottomTabNav } from "@/components/layout/bottom-tab-nav";
import { useCouple } from "@/store/couple";
import {
  getCategoriesOfPath,
  getCoupleSlug,
  getTotalConfirmed,
  getVendorOrVenueBySlug,
} from "@/lib/couple-helpers";
import { formatBRL, formatDateExtended } from "@/lib/format";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

/**
 * /checkout — Confirmação final + tela de celebração (briefing §5.8).
 *
 * - Hero editorial com mood board automático 2x2 das capas escolhidas
 * - Lista de escolhas (uma por categoria)
 * - Card total grande
 * - Bloco de garantia
 * - Checkbox + CTA gigante
 * - Loading 2.5s → Celebration screen
 */

type Stage = "review" | "loading" | "celebration";

export default function CheckoutPage() {
  const router = useRouter();
  const partner_1_name = useCouple((s) => s.partner_1_name);
  const partner_2_name = useCouple((s) => s.partner_2_name);
  const wedding_date = useCouple((s) => s.wedding_date);
  const city = useCouple((s) => s.city);
  const state = useCouple((s) => s.state);
  const selections = useCouple((s) => s.selections);
  const skipped_categories = useCouple((s) => s.skipped_categories);
  const wedding_profile_slug = useCouple((s) => s.wedding_profile_slug);
  const setStatus = useCouple((s) => s.setStatus);
  const onboardingComplete = useCouple((s) => s.onboarding_complete);

  const [hydrated, setHydrated] = useState(false);
  const [stage, setStage] = useState<Stage>("review");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && !onboardingComplete) {
      router.replace("/comece");
    }
  }, [hydrated, onboardingComplete, router]);

  if (!hydrated) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <p className="text-muted-foreground">Carregando…</p>
      </main>
    );
  }

  const totalConfirmed = getTotalConfirmed(selections);
  const slug = getCoupleSlug(partner_1_name, partner_2_name);

  // Mood board: pega até 4 capas dos profissionais escolhidos
  const moodBoardImages = selections
    .slice(0, 4)
    .map((s) => {
      const v = getVendorOrVenueBySlug(s.vendor_slug);
      return v?.cover;
    })
    .filter((url): url is string => !!url);
  // Se tiver menos de 4, repete pra preencher
  while (moodBoardImages.length < 4 && moodBoardImages.length > 0) {
    moodBoardImages.push(moodBoardImages[moodBoardImages.length % moodBoardImages.length]);
  }

  function handleConfirm() {
    if (!agreed) return;
    setStage("loading");
    setTimeout(() => {
      setStatus("complete");
      setStage("celebration");
    }, 2500);
  }

  if (stage === "celebration") {
    return <CelebrationScreen slug={slug} />;
  }

  if (stage === "loading") {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center bg-background safe-px">
        <Ornament size="xl" pulse />
        <p className="font-display text-2xl md:text-3xl text-foreground mt-8 tracking-editorial">
          Confirmando o casamento de vocês...
        </p>
      </main>
    );
  }

  return (
    <>
      <CoupleNavbar />

      <main className="min-h-dvh pt-couple pb-24 md:pb-20 safe-px">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <BackLink
            href="/meu-casamento"
            label="Voltar ao meu casamento"
            className="mb-6"
          />

          {/* Mood board hero */}
          <section className="relative aspect-square sm:aspect-video md:aspect-[16/9] rounded-md overflow-hidden mb-10 md:mb-12 isolate">
            {moodBoardImages.length > 0 ? (
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1">
                {moodBoardImages.map((url, i) => (
                  <div key={i} className="relative bg-muted overflow-hidden">
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 bg-muted" />
            )}
            <div className="absolute inset-0 overlay-dark-60" />
            <div className="relative h-full flex flex-col items-center justify-center text-center px-6 text-white">
              <Overline className="!text-white/70 mb-3 md:mb-4">
                Seu casamento
              </Overline>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-editorial leading-[1.05]">
                {partner_1_name} & {partner_2_name}
              </h1>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-white/85 tracking-wide">
                {city}
                {state && `, ${state}`}
                {wedding_date && ` · ${formatDateExtended(wedding_date)}`}
              </p>
            </div>
          </section>

          {/* Resumo das escolhas */}
          <section className="mb-10 md:mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-editorial mb-5">
              Quem faz parte do seu dia
            </h2>
            <div className="space-y-3 md:space-y-4">
              {selections.map((selection) => {
                const vendor = getVendorOrVenueBySlug(selection.vendor_slug);
                const category = categories.find(
                  (c) => c.slug === selection.category_slug,
                );
                const pkg = vendor?.packages.find(
                  (p) => p.id === selection.package_id,
                );
                if (!vendor || !category) return null;

                return (
                  <article
                    key={selection.category_slug}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 bg-card border border-border rounded-md p-4 md:p-5"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative size-16 md:size-20 rounded-sm overflow-hidden bg-muted shrink-0">
                        <Image
                          src={vendor.cover}
                          alt={vendor.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Overline>{category.name}</Overline>
                        <p className="font-display text-lg md:text-xl text-foreground leading-tight mt-0.5 truncate">
                          {vendor.name}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                          {pkg?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 sm:shrink-0">
                      <p className="font-display text-base md:text-lg text-foreground tracking-editorial">
                        {formatBRL(selection.quoted_price)}
                      </p>
                      <Link
                        href={`/oferta/${vendor.slug}`}
                        className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors min-h-11 inline-flex items-center"
                      >
                        Alterar
                      </Link>
                    </div>
                  </article>
                );
              })}

              {selections.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-8">
                  Vocês ainda não escolheram nenhum profissional. Voltem para
                  /planejamento.
                </p>
              )}

              {/* Pendentes — só conta categorias do path do perfil do casal,
                  não as 9 totais. E ignora as que foram explicitamente puladas. */}
              {(() => {
                const path = getCategoriesOfPath(wedding_profile_slug);
                const pending = path.filter(
                  (slug) =>
                    !selections.some((s) => s.category_slug === slug) &&
                    !skipped_categories.includes(slug),
                );
                if (pending.length === 0) return null;
                return (
                  <p className="text-sm text-muted-foreground italic px-4 py-3 bg-muted/50 rounded-sm border border-border">
                    <strong className="text-foreground not-italic">
                      {pending.length}{" "}
                      {pending.length === 1 ? "categoria" : "categorias"}
                    </strong>{" "}
                    {pending.length === 1 ? "ficou" : "ficaram"} para depois. Sem
                    problema, vocês podem adicionar quando quiserem.
                  </p>
                );
              })()}
            </div>
          </section>

          {/* Total */}
          <section className="bg-muted rounded-md p-6 md:p-8 mb-8 md:mb-10 text-center">
            <Overline className="mb-2">Total do casamento</Overline>
            <p className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground tracking-editorial leading-none">
              {formatBRL(totalConfirmed)}
            </p>
            <p className="mt-3 text-sm text-muted-foreground tracking-wide">
              Reserva válida por 48 horas
            </p>
          </section>

          {/* Garantia */}
          <section className="bg-primary/5 border border-primary/20 rounded-md p-5 md:p-6 mb-8 md:mb-10 flex items-start gap-4">
            <span className="shrink-0 flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="font-display text-lg md:text-xl text-foreground tracking-editorial leading-tight">
                Garantia we.wedme
              </p>
              <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
                Cada profissional passou pela nossa curadoria. Se qualquer
                imprevisto impedir a entrega no seu dia, substituímos por um
                equivalente verificado. Caso contrário, devolvemos 100% + R$500 de crédito.
              </p>
            </div>
          </section>

          {/* Pagamento (mockup) */}
          <section className="bg-card border border-border rounded-md p-6 md:p-8">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-editorial mb-6">
              Pagamento
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground tracking-wide block mb-1.5">
                  Número do cartão
                </label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="w-full min-h-11 px-4 py-3 rounded-sm border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground tracking-wide block mb-1.5">
                    Validade
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full min-h-11 px-4 py-3 rounded-sm border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground tracking-wide block mb-1.5">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    maxLength={4}
                    className="w-full min-h-11 px-4 py-3 rounded-sm border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground tracking-wide block mb-1.5">
                  Nome no cartão
                </label>
                <input
                  type="text"
                  placeholder="Como aparece no cartão"
                  className="w-full min-h-11 px-4 py-3 rounded-sm border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Protótipo. Nenhum dado é processado ou armazenado.
            </p>
          </section>

          {/* Confirmação */}
          <section className="space-y-4">
            <button
              type="button"
              onClick={() =>
                alert(
                  "Termos da curadoria (em produção abre um modal com o contrato completo).",
                )
              }
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Revisar termos da curadoria
            </button>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 size-5 rounded-sm border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground leading-relaxed">
                Li e concordo com os termos da curadoria we.wedme.
              </span>
            </label>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!agreed || selections.length === 0}
              className={cn(
                "w-full inline-flex items-center justify-center min-h-16 md:min-h-[68px] px-8 py-5 rounded-sm bg-primary text-primary-foreground text-base md:text-lg font-medium tracking-wide hover:bg-brand-wine transition-colors duration-200",
                "disabled:opacity-40 disabled:pointer-events-none",
              )}
            >
              Confirmar meu casamento
            </button>

            <p className="text-xs text-muted-foreground text-center tracking-wide">
              Esta é uma simulação. Nenhum pagamento é processado.
            </p>
          </section>
        </div>
      </main>
      <BottomTabNav />
      <SpecialistWidget />
    </>
  );
}
