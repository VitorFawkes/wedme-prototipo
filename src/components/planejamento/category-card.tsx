"use client";

import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
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
import type { Category, Selection } from "@/types";
import { cn } from "@/lib/utils";
import { getVendorOrVenueBySlug } from "@/lib/couple-helpers";
import { formatBRL } from "@/lib/format";

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
}: {
  category: Category;
  order: number;
  selection?: Selection;
}) {
  const Icon = ICONS[category.icon_name] ?? MapPin;
  const isSelected = !!selection;
  const vendor = selection ? getVendorOrVenueBySlug(selection.vendor_slug) : null;

  return (
    <Link
      href={`/planejamento/${category.slug}`}
      className={cn(
        "group relative block rounded-md border overflow-hidden transition-all duration-300 hover:shadow-lg active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background min-h-[200px] md:min-h-[220px] flex flex-col",
        isSelected
          ? "bg-primary/5 border-primary/30"
          : "bg-card border-border",
      )}
    >
      {isSelected && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-foreground/90 text-background text-xs font-medium tracking-wide px-2.5 py-1 rounded-sm backdrop-blur-sm z-10">
          <Check className="size-3" /> Escolhido
        </span>
      )}

      <div className="flex items-start justify-between p-5 md:p-6 gap-3">
        <span className="font-display text-3xl md:text-4xl font-medium text-muted-foreground tracking-editorial leading-none">
          {String(order).padStart(2, "0")}
        </span>
        <Icon className="size-6 text-primary/60 mt-1" aria-hidden="true" />
      </div>

      <div className="px-5 md:px-6 pb-5 md:pb-6 mt-auto">
        <h3 className="font-display text-xl md:text-2xl font-medium text-foreground tracking-editorial leading-tight mb-1">
          {category.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-1">
          {category.short_description}
        </p>

        {isSelected && vendor ? (
          <div className="flex items-center gap-3 pt-3 border-t border-primary/20">
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
        ) : (
          <span className="inline-flex items-center text-sm font-medium text-primary tracking-wide">
            Ver opções →
          </span>
        )}
      </div>
    </Link>
  );
}
