"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CoupleNavbar } from "@/components/layout/couple-navbar";
import { CategoryCard } from "@/components/planejamento/category-card";
import { ProgressFooter } from "@/components/planejamento/progress-footer";
import { TriggerInlineCard } from "@/components/triggers/trigger-inline-card";
import { TriggerRenderer, useInlineTriggers } from "@/components/triggers/trigger-renderer";
import { SpecialistWidget } from "@/components/specialist/specialist-widget";
import { BottomTabNav } from "@/components/layout/bottom-tab-nav";
import { Overline } from "@/components/ornaments/overline";
import { useCouple } from "@/store/couple";
import { profiles } from "@/data/profiles";
import { categories } from "@/data/categories";
import { formatBRL, formatDateExtended } from "@/lib/format";

/**
 * /planejamento — Tela principal pós-onboarding (briefing §5.4).
 *
 * - Hero compacto com nome do perfil + descrição
 * - Banner de gatilho de boas-vindas (#1)
 * - Grid de categorias na ordem do perfil
 * - Rodapé sticky de progresso (se ≥1 seleção)
 *
 * Mobile: 1 col cards, padding reduzido, rodapé sticky
 * Desktop: 2-3 cols, padding generoso
 */
export default function PlanejamentoPage() {
  const router = useRouter();
  const partner_1_name = useCouple((s) => s.partner_1_name);
  const partner_2_name = useCouple((s) => s.partner_2_name);
  const wedding_profile_slug = useCouple((s) => s.wedding_profile_slug);
  const dream_text = useCouple((s) => s.dream_text);
  const city = useCouple((s) => s.city);
  const wedding_date = useCouple((s) => s.wedding_date);
  const estimated_budget = useCouple((s) => s.estimated_budget);
  const selections = useCouple((s) => s.selections);
  const skipped_categories = useCouple((s) => s.skipped_categories);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const { triggers: inlineTriggers, dismiss } = useInlineTriggers();

  // Redireciona se não tem perfil
  useEffect(() => {
    if (hydrated && !wedding_profile_slug) {
      router.replace("/comece");
    }
  }, [hydrated, wedding_profile_slug, router]);

  if (!hydrated || !wedding_profile_slug) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <p className="text-muted-foreground">Carregando…</p>
      </main>
    );
  }

  const profile = profiles.find((p) => p.slug === wedding_profile_slug);
  if (!profile) return null;

  const pathCategories = profile.default_path_categories
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <>
      <CoupleNavbar />
      <TriggerRenderer />

      <main className="min-h-dvh pt-couple pb-40 md:pb-32 safe-px">
        {/* Hero compacto */}
        <section className="bg-muted px-4 md:px-12 py-12 md:py-16 text-center">
          <Overline className="mb-3 md:mb-4">
            Seu caminho personalizado
          </Overline>
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-medium text-foreground tracking-editorial leading-tight max-w-3xl mx-auto">
            Entendemos o sonho de vocês
          </h1>
          {dream_text && dream_text.length > 20 && (
            <p className="font-display italic text-base md:text-xl text-muted-foreground mt-4 md:mt-6 max-w-2xl mx-auto leading-relaxed">
              &ldquo;{dream_text.length > 120 ? dream_text.slice(0, 120).replace(/\s+\S*$/, "") + "..." : dream_text}&rdquo;
            </p>
          )}
          <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs md:text-sm text-muted-foreground tracking-wide">
            {city && (
              <span>
                Casamento em <strong className="text-foreground">{city}</strong>
              </span>
            )}
            {wedding_date && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  <strong className="text-foreground">
                    {formatDateExtended(wedding_date)}
                  </strong>
                </span>
              </>
            )}
            {estimated_budget && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  Orçamento de{" "}
                  <strong className="text-foreground">
                    {formatBRL(estimated_budget)}
                  </strong>
                </span>
              </>
            )}
          </div>
        </section>

        {/* Conteúdo */}
        <section className="px-4 md:px-12 py-10 md:py-16 max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-editorial leading-tight">
              Seu plano para o grande dia
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
              Na ordem ideal para o perfil de vocês. Podem começar por qualquer
              uma, mas a gente sugere seguir a sequência.
            </p>
          </div>

          {/* Inline triggers (boas-vindas, etc) */}
          {inlineTriggers.length > 0 && (
            <div className="mb-8 md:mb-10 space-y-4">
              {inlineTriggers.map((t) => (
                <TriggerInlineCard
                  key={t.rule.slug}
                  trigger={t}
                  onDismiss={() => dismiss(t.rule.slug)}
                />
              ))}
            </div>
          )}

          {/* Grid de categorias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {pathCategories.map((category, idx) => (
              <CategoryCard
                key={category.slug}
                category={category}
                order={idx + 1}
                selection={selections.find(
                  (s) => s.category_slug === category.slug,
                )}
                isSkipped={skipped_categories.includes(category.slug)}
              />
            ))}
          </div>

          {/* Helper text sobre pular */}
          <p className="text-center mt-10 md:mt-12 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Não precisam fechar tudo pela plataforma. Vocês podem{" "}
            <strong className="text-foreground font-medium">pular categorias</strong>{" "}
            que já tem, ou que preferem resolver depois. O casamento segue firme.
          </p>
        </section>
      </main>

      <ProgressFooter />
      <BottomTabNav />
      <SpecialistWidget />
    </>
  );
}
