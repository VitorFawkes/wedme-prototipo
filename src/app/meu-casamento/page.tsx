"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, Circle, Minus, ChevronRight } from "lucide-react";
import { CoupleNavbar } from "@/components/layout/couple-navbar";
import { TriggerInlineCard } from "@/components/triggers/trigger-inline-card";
import {
  TriggerRenderer,
  useInlineTriggers,
} from "@/components/triggers/trigger-renderer";
import { SpecialistWidget } from "@/components/specialist/specialist-widget";
import { BottomTabNav } from "@/components/layout/bottom-tab-nav";
import { PersonalizeSite } from "@/components/meu-casamento/personalize-site";
import { Overline } from "@/components/ornaments/overline";
import { Ornament } from "@/components/ornaments/ornament";
import { useCouple } from "@/store/couple";
import { COLOR_PALETTES } from "@/data/services";
import { profiles } from "@/data/profiles";
import {
  getCategoriesOfPath,
  getCoupleSlug,
  getProgressPercent,
  getRemainingBudget,
  getTotalConfirmed,
  getVendorOrVenueBySlug,
} from "@/lib/couple-helpers";
import { categories } from "@/data/categories";
import { formatBRL, formatDateExtended } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * /meu-casamento — Dashboard do casal (briefing §5.7).
 *
 * - Hero compacto com nomes + cidade/data
 * - Barra de progresso grande
 * - Top bar / inline triggers / floating badges via TriggerRenderer
 * - Resumo financeiro 3 cards
 * - Lista de categorias com status
 * - Card "Próximo passo sugerido"
 * - Preview do site se >= 50%
 */
export default function MeuCasamentoPage() {
  const router = useRouter();
  const partner_1_name = useCouple((s) => s.partner_1_name);
  const partner_2_name = useCouple((s) => s.partner_2_name);
  const wedding_date = useCouple((s) => s.wedding_date);
  const city = useCouple((s) => s.city);
  const estimated_budget = useCouple((s) => s.estimated_budget);
  const wedding_profile_slug = useCouple((s) => s.wedding_profile_slug);
  const selections = useCouple((s) => s.selections);
  const skipped_categories = useCouple((s) => s.skipped_categories);
  const onboardingComplete = useCouple((s) => s.onboarding_complete);
  const colorPalette = useCouple((s) => s.wedding_color_palette);
  const scenario = useCouple((s) => s.wedding_scenario);
  const guest_count = useCouple((s) => s.guest_count);

  const { triggers: inlineTriggers, dismiss } = useInlineTriggers();

  const [hydrated, setHydrated] = useState(false);
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

  const path = getCategoriesOfPath(wedding_profile_slug);
  const totalConfirmed = getTotalConfirmed(selections);
  const remaining = getRemainingBudget(estimated_budget, selections);
  const progress = getProgressPercent(selections, wedding_profile_slug);
  const pendingCount = path.length - selections.length - skipped_categories.length;
  const slug = getCoupleSlug(partner_1_name, partner_2_name);

  // Próxima categoria pendente para "Próximo passo"
  const nextPending = path.find(
    (cat) =>
      !selections.some((s) => s.category_slug === cat) &&
      !skipped_categories.includes(cat),
  );
  const nextPendingCategory = nextPending
    ? categories.find((c) => c.slug === nextPending)
    : null;

  return (
    <>
      <CoupleNavbar />
      <TriggerRenderer />

      <main className="min-h-dvh pt-couple pb-24 md:pb-20 safe-px">
        {/* Hero compacto */}
        <section className="bg-muted px-4 md:px-12 py-8 md:py-12">
          <div className="max-w-5xl mx-auto">
            <Overline className="mb-2 md:mb-3">Meu casamento</Overline>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium text-foreground tracking-editorial leading-tight">
              Olá, {partner_1_name} e {partner_2_name}
            </h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              Casamento em <strong className="text-foreground">{city}</strong>
              {wedding_date && (
                <>
                  {" · "}
                  <strong className="text-foreground">
                    {formatDateExtended(wedding_date)}
                  </strong>
                </>
              )}
            </p>

            <div className="mt-6 md:mt-8">
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                <strong className="text-foreground">
                  {selections.length} de {path.length}
                </strong>{" "}
                categorias escolhidas ·{" "}
                <strong className="text-foreground">{progress}%</strong> do
                caminho
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 md:px-12 py-8 md:py-12 space-y-8 md:space-y-12">
          {/* Inline triggers */}
          {inlineTriggers.length > 0 && (
            <div className="space-y-4">
              {inlineTriggers.map((t) => (
                <TriggerInlineCard
                  key={t.rule.slug}
                  trigger={t}
                  onDismiss={() => dismiss(t.rule.slug)}
                />
              ))}
            </div>
          )}

          {/* Website CTA */}
          <section className="bg-card border border-border rounded-md p-6 md:p-8">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-editorial italic leading-tight mb-3">
              Website
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Você ainda não criou o site do seu casamento. Nele seus convidados poderão confirmar presença e também ver os detalhes da celebração.
            </p>
            <Link
              href={slug ? `/casamento/${slug}` : "#"}
              className="inline-flex items-center justify-center min-h-11 px-6 py-3 rounded-sm border border-primary text-primary text-sm font-medium tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
            >
              Criar Website
            </Link>
          </section>

          {/* Detalhes do casamento */}
          <section className="bg-secondary/50 rounded-md p-6 md:p-8 space-y-0 divide-y divide-border">
            <DetailRow label="Data" value={wedding_date ? formatDateExtended(wedding_date) : "Não definida"} />
            <DetailRow label="Cidade" value={city ?? "Não definida"} />
            <DetailRow label="Convidados" value={guest_count ? `${guest_count} convidados` : "Não definido"} />
            <DetailRow
              label="Plano"
              value={wedding_profile_slug ? (profiles.find(p => p.slug === wedding_profile_slug)?.name ?? "Não definido") : "Não definido"}
              alterHref="/comece/sonho"
            />
            <DetailRow label="Cenário" value={scenario ?? "Não definido"} alterHref="/planejamento" />
            <DetailRow
              label="Paleta de cores"
              value={colorPalette ? (COLOR_PALETTES.find(p => p.id === colorPalette)?.name ?? "Não definida") : "Não definida"}
              alterHref="/planejamento/decoracao"
            />
          </section>

          {/* Resumo financeiro */}
          <section>
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-editorial mb-5">
              Resumo financeiro
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <FinanceCard
                label="Confirmado"
                value={formatBRL(totalConfirmed)}
              />
              <FinanceCard
                label="Disponível"
                value={
                  estimated_budget ? formatBRL(remaining) : "-"
                }
              />
              <FinanceCard
                label="Categorias pendentes"
                value={String(Math.max(0, pendingCount))}
              />
            </div>
          </section>

          {/* Lista de categorias com status */}
          <section>
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-editorial mb-5">
              Suas categorias
            </h2>
            <div className="bg-card border border-border rounded-md overflow-hidden">
              {path.map((catSlug, idx) => {
                const category = categories.find((c) => c.slug === catSlug);
                if (!category) return null;
                const selection = selections.find(
                  (s) => s.category_slug === catSlug,
                );
                const isSkipped = skipped_categories.includes(catSlug);
                const vendor = selection
                  ? getVendorOrVenueBySlug(selection.vendor_slug)
                  : null;

                return (
                  <Link
                    key={catSlug}
                    href={`/planejamento/${catSlug}`}
                    className={cn(
                      "flex items-center gap-3 md:gap-4 px-4 md:px-6 py-4 md:py-5 transition-colors hover:bg-muted/50 active:bg-muted",
                      idx > 0 && "border-t border-border",
                    )}
                  >
                    <StatusIcon
                      status={
                        selection
                          ? "selected"
                          : isSkipped
                            ? "skipped"
                            : "pending"
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-base md:text-lg text-foreground leading-tight truncate">
                        {category.name}
                      </p>
                      {vendor && (
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                          {vendor.name}
                        </p>
                      )}
                      {isSkipped && (
                        <p className="text-xs text-muted-foreground italic">
                          Pulada
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                      {selection && (
                        <span className="font-display text-sm md:text-base text-foreground tracking-wide hidden sm:block">
                          {formatBRL(selection.quoted_price)}
                        </span>
                      )}
                      <span className="text-xs md:text-sm text-primary font-medium tracking-wide flex items-center">
                        {selection ? "Ver escolha" : "Escolher"}
                        <ChevronRight className="size-4 ml-0.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Próximo passo */}
          <section className="bg-primary/5 border border-primary/30 rounded-md p-6 md:p-8">
            <Overline className="mb-2">Próximo passo</Overline>
            {nextPendingCategory ? (
              <>
                <h3 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-editorial leading-tight">
                  Vocês ainda não escolheram{" "}
                  <span className="text-primary">{nextPendingCategory.name}</span>
                </h3>
                <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  É uma das categorias mais importantes para o perfil de vocês.
                </p>
                <Link
                  href={`/planejamento/${nextPendingCategory.slug}`}
                  className="inline-flex items-center justify-center min-h-12 px-6 md:px-7 mt-5 rounded-sm bg-primary text-primary-foreground text-sm md:text-base font-medium tracking-wide hover:bg-brand-wine transition-colors"
                >
                  Escolher agora →
                </Link>
              </>
            ) : (
              <>
                <h3 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-editorial leading-tight">
                  Tudo pronto
                </h3>
                <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  Vocês estão a um clique de confirmar o casamento.
                </p>
                <Link
                  href="/checkout"
                  className="inline-flex items-center justify-center min-h-12 px-6 md:px-7 mt-5 rounded-sm bg-primary text-primary-foreground text-sm md:text-base font-medium tracking-wide hover:bg-brand-wine transition-colors"
                >
                  Ir ao checkout →
                </Link>
              </>
            )}
          </section>

          {/* Personalize site */}
          <PersonalizeSite />

          {/* Preview do site (>= 50%) */}
          {progress >= 50 && (
            <section className="bg-muted rounded-md p-6 md:p-8 text-center">
              <Ornament size="lg" className="mb-4" />
              <h3 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-editorial leading-tight">
                Preview do site de vocês
              </h3>
              <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Assim ele vai ficar quando vocês finalizarem tudo.
              </p>
              <Link
                href={`/casamento/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-12 px-6 md:px-7 mt-5 rounded-sm border border-primary text-primary text-sm md:text-base font-medium tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Ver preview →
              </Link>
            </section>
          )}
        </div>
      </main>
      <BottomTabNav />
      <SpecialistWidget />
    </>
  );
}

function FinanceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-md p-5 md:p-6">
      <p className="font-display text-2xl md:text-3xl text-foreground tracking-editorial leading-tight">
        {value}
      </p>
      <Overline className="mt-2">{label}</Overline>
    </div>
  );
}

function DetailRow({
  label,
  value,
  alterHref,
}: {
  label: string;
  value: string;
  alterHref?: string;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-xs text-muted-foreground tracking-wide">{label}</p>
        <p className="font-display text-base md:text-lg font-medium text-foreground">{value}</p>
      </div>
      {alterHref && (
        <Link
          href={alterHref}
          className="text-sm text-primary font-medium tracking-wide hover:underline"
        >
          alterar
        </Link>
      )}
    </div>
  );
}

function StatusIcon({
  status,
}: {
  status: "selected" | "skipped" | "pending";
}) {
  if (status === "selected") {
    return (
      <span className="flex items-center justify-center size-7 rounded-full bg-primary text-primary-foreground shrink-0">
        <Check className="size-4" />
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span className="flex items-center justify-center size-7 rounded-full bg-muted text-muted-foreground shrink-0">
        <Minus className="size-4" />
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center size-7 rounded-full border border-border text-muted-foreground shrink-0">
      <Circle className="size-3" />
    </span>
  );
}
