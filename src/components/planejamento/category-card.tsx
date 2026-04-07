"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Check, MinusCircle, X as XIcon } from "lucide-react";
import {
  MapPin,
  Camera,
  Utensils,
  Sparkles,
  Flower2,
  Shirt,
  Music,
  Mail,
  Film,
  type LucideIcon,
} from "lucide-react";
import type { Category, CategorySlug, Selection } from "@/types";
import { cn } from "@/lib/utils";
import { getVendorOrVenueBySlug } from "@/lib/couple-helpers";
import { formatBRL } from "@/lib/format";
import { useCouple } from "@/store/couple";

const ICONS: Record<string, LucideIcon> = {
  MapPin,
  Camera,
  Utensils,
  Sparkles,
  Flower2,
  Shirt,
  Music,
  Mail,
  Film,
};

/**
 * Card de categoria do /planejamento.
 *
 * - min-h-[180px], padding responsivo
 * - Quando escolhida: bg-primary/5, badge verde, mini-card do profissional
 * - Quando não: botão "Ver opções"
 */
export function CategoryCard({
  category,
  order,
  selection,
  isSkipped = false,
}: {
  category: Category;
  order: number;
  selection?: Selection;
  isSkipped?: boolean;
}) {
  const Icon = ICONS[category.icon_name] ?? MapPin;
  const isSelected = !!selection;
  const vendor = selection ? getVendorOrVenueBySlug(selection.vendor_slug) : null;
  const skipCategory = useCouple((s) => s.skipCategory);
  const unskipCategory = useCouple((s) => s.unskipCategory);
  const [confirmingSkip, setConfirmingSkip] = useState(false);

  function handleSkip(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirmingSkip(true);
  }

  function confirmSkip(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    skipCategory(category.slug as CategorySlug);
    setConfirmingSkip(false);
  }

  function cancelSkip(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirmingSkip(false);
  }

  function handleUnskip(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    unskipCategory(category.slug as CategorySlug);
  }

  // ============================================================
  // Estado: PULADA
  // ============================================================
  if (isSkipped) {
    return (
      <div
        className={cn(
          "relative block rounded-md border border-border border-dashed bg-background/40 min-h-[200px] md:min-h-[220px] flex flex-col p-5 md:p-6",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="font-display text-3xl md:text-4xl font-medium text-muted-foreground/50 tracking-editorial leading-none line-through">
            {String(order).padStart(2, "0")}
          </span>
          <Icon className="size-6 text-muted-foreground/40" aria-hidden="true" />
        </div>
        <div className="mt-auto">
          <h3 className="font-display text-xl md:text-2xl font-medium text-muted-foreground/70 tracking-editorial leading-tight line-through mb-1">
            {category.name}
          </h3>
          <p className="text-xs text-muted-foreground italic mb-3">
            Pulada. Vocês podem voltar quando quiserem.
          </p>
          <button
            type="button"
            onClick={handleUnskip}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary tracking-wide hover:underline"
          >
            Voltar a esta categoria
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // Estado: NORMAL ou SELECTED — usa pattern "stretched link overlay"
  // <article> com <Link absolute inset-0> + botão pular relative z-10
  // (HTML válido, sem <button> aninhado em <a>)
  // ============================================================
  return (
    <article
      className={cn(
        "group relative rounded-md border overflow-hidden transition-all duration-300 hover:shadow-lg min-h-[200px] md:min-h-[220px] flex flex-col",
        isSelected
          ? "bg-primary/5 border-primary/30"
          : "bg-card border-border",
      )}
    >
      {/* Stretched link cobre todo o card EXCETO os botões z-10 abaixo */}
      <Link
        href={`/planejamento/${category.slug}`}
        className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
        aria-label={`Ver opções de ${category.name}`}
      />

      {isSelected && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-foreground/90 text-background text-xs font-medium tracking-wide px-2.5 py-1 rounded-sm backdrop-blur-sm z-10 pointer-events-none">
          <Check className="size-3" /> Escolhido
        </span>
      )}

      <div className="flex items-start justify-between p-5 md:p-6 gap-3 pointer-events-none">
        <span className="font-display text-3xl md:text-4xl font-medium text-muted-foreground tracking-editorial leading-none">
          {String(order).padStart(2, "0")}
        </span>
        <Icon className="size-6 text-primary/60 mt-1" aria-hidden="true" />
      </div>

      <div className="px-5 md:px-6 pb-5 md:pb-6 mt-auto">
        <div className="pointer-events-none">
          <h3 className="font-display text-xl md:text-2xl font-medium text-foreground tracking-editorial leading-tight mb-1">
            {category.name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-1">
            {category.short_description}
          </p>
        </div>

        {isSelected && vendor ? (
          <div className="flex items-center gap-3 pt-3 border-t border-primary/20 pointer-events-none">
            <div className="relative shrink-0 size-10 rounded-sm overflow-hidden bg-muted">
              <Image
                src={vendor.cover}
                alt={vendor.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {vendor.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBRL(selection.quoted_price)}
              </p>
            </div>
          </div>
        ) : confirmingSkip ? (
          <div className="flex items-center gap-2 pt-2 relative z-10">
            <button
              type="button"
              onClick={confirmSkip}
              className="flex-1 inline-flex items-center justify-center min-h-10 px-3 text-xs font-medium text-muted-foreground bg-muted border border-border rounded-sm hover:bg-border/50 transition-colors"
            >
              Sim, pular
            </button>
            <button
              type="button"
              onClick={cancelSkip}
              className="inline-flex items-center justify-center min-h-10 min-w-10 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cancelar"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center text-sm font-medium text-primary tracking-wide pointer-events-none">
              Ver opções →
            </span>
            <button
              type="button"
              onClick={handleSkip}
              className="relative z-10 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-8 px-2 -mr-2"
              aria-label={`Pular ${category.name}`}
              title="Pular esta categoria"
            >
              <MinusCircle className="size-3.5" />
              Pular
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
