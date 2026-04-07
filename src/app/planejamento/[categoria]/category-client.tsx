"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
import { CoupleNavbar } from "@/components/layout/couple-navbar";
import { VendorCard } from "@/components/planejamento/vendor-card";
import { ProgressFooter } from "@/components/planejamento/progress-footer";
import { TriggerInlineCard } from "@/components/triggers/trigger-inline-card";
import {
  TriggerRenderer,
  useInlineTriggers,
} from "@/components/triggers/trigger-renderer";
import { SpecialistWidget } from "@/components/specialist/specialist-widget";
import { useCouple } from "@/store/couple";
import {
  getProvidersByCategory,
  sortVendorsForProfile,
} from "@/lib/couple-helpers";
import { categories } from "@/data/categories";
import { formatBRL } from "@/lib/format";
import type { CategorySlug } from "@/types";

export function CategoryClient({
  categorySlug,
}: {
  categorySlug: CategorySlug;
}) {
  const profileSlug = useCouple((s) => s.wedding_profile_slug);
  const city = useCouple((s) => s.city);
  const dreamText = useCouple((s) => s.dream_text);
  const selections = useCouple((s) => s.selections);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const { triggers: inlineTriggers, dismiss } = useInlineTriggers();

  const category = categories.find((c) => c.slug === categorySlug);
  const providers = getProvidersByCategory(categorySlug);
  const sorted = sortVendorsForProfile(
    providers,
    profileSlug,
    categorySlug,
    dreamText,
    city,
  );
  const existingSelection = selections.find(
    (s) => s.category_slug === categorySlug,
  );

  if (!category) return null;

  return (
    <>
      <CoupleNavbar />
      <TriggerRenderer />

      <main className="min-h-dvh pt-couple pb-32 safe-px">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-12">
          {/* Voltar para o plano (categoria pai) */}
          <BackLink href="/planejamento" label="Voltar ao meu plano" className="mb-6" />

          {/* Header */}
          <div className="mb-8 md:mb-10">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-foreground tracking-editorial leading-tight">
              {category.name}
            </h1>
            <p className="mt-3 md:mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
              {sorted.length}{" "}
              {categorySlug === "local"
                ? sorted.length === 1
                  ? "espaço selecionado"
                  : "espaços selecionados"
                : sorted.length === 1
                  ? "profissional selecionado"
                  : "profissionais selecionados"}{" "}
              para vocês{city && ` em ${city}`}.
            </p>
          </div>

          {/* Banner se já tem seleção */}
          {hydrated && existingSelection && (
            <ExistingSelectionBanner
              selection={existingSelection}
              categorySlug={categorySlug}
            />
          )}

          {/* Inline triggers (prova social específica) */}
          {hydrated && inlineTriggers.length > 0 && (
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

          {/* Grid de vendors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {sorted.map((vendor) => (
              <VendorCard key={vendor.slug} vendor={vendor} />
            ))}
          </div>

          {/* Pular esta categoria */}
          <SkipCategoryButton categorySlug={categorySlug} />
        </div>
      </main>

      <ProgressFooter />
      <SpecialistWidget />
    </>
  );
}

function SkipCategoryButton({ categorySlug }: { categorySlug: CategorySlug }) {
  const router = useRouter();
  const skipCategory = useCouple((s) => s.skipCategory);
  const [confirming, setConfirming] = useState(false);

  function handleSkip() {
    skipCategory(categorySlug);
    router.push("/planejamento");
  }

  if (confirming) {
    return (
      <div className="mt-12 md:mt-16 max-w-md mx-auto bg-muted border border-border rounded-md p-5 md:p-6 text-center">
        <p className="font-display text-base md:text-lg text-foreground leading-snug mb-1">
          Tem certeza?
        </p>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          Vocês podem voltar e escolher depois, a qualquer momento.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex items-center justify-center min-h-11 px-5 rounded-sm border border-border bg-background text-sm font-medium text-foreground hover:border-primary transition-colors"
          >
            Sim, pular por enquanto
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="inline-flex items-center justify-center min-h-11 px-5 rounded-sm text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center mt-12 md:mt-16">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
      >
        Pular esta categoria
      </button>
    </div>
  );
}

function ExistingSelectionBanner({
  selection,
  categorySlug,
}: {
  selection: { vendor_slug: string; quoted_price: number; package_id: string };
  categorySlug: CategorySlug;
}) {
  const removeSelection = useCouple((s) => s.removeSelection);
  // Lookup do vendor (precisa ser feito no client)
  const [vendor, setVendor] = useState<{
    name: string;
    cover: string;
    slug: string;
    packages: { id: string; name: string }[];
  } | null>(null);

  useEffect(() => {
    import("@/lib/couple-helpers").then(({ getVendorOrVenueBySlug }) => {
      const v = getVendorOrVenueBySlug(selection.vendor_slug);
      if (v) setVendor(v);
    });
  }, [selection.vendor_slug]);

  if (!vendor) return null;
  const pkg = vendor.packages.find((p) => p.id === selection.package_id);

  return (
    <div className="mb-6 md:mb-8 bg-primary/5 border border-primary/30 rounded-md p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="relative size-16 md:size-20 rounded-sm overflow-hidden bg-muted shrink-0">
        <Image
          src={vendor.cover}
          alt={vendor.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-widest text-primary font-medium mb-1">
          Você já escolheu
        </p>
        <p className="font-display text-lg md:text-xl text-foreground leading-tight">
          {vendor.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {pkg?.name ?? "Pacote escolhido"} ·{" "}
          <span className="text-foreground font-medium">
            {formatBRL(selection.quoted_price)}
          </span>
        </p>
      </div>
      <div className="flex flex-row gap-2 w-full sm:w-auto">
        <Link
          href={`/oferta/${vendor.slug}`}
          className="inline-flex items-center justify-center min-h-11 px-4 rounded-sm border border-primary text-primary text-sm font-medium tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors flex-1 sm:flex-initial"
        >
          Ver detalhes
        </Link>
        <button
          type="button"
          onClick={() => removeSelection(categorySlug)}
          className="inline-flex items-center justify-center min-h-11 px-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Trocar
        </button>
      </div>
    </div>
  );
}
