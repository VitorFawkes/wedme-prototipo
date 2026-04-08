"use client";

import { Check } from "lucide-react";
import type { ServiceItem } from "@/types";
import { formatBRL } from "@/lib/format";

type Props = {
  item: ServiceItem;
  selected: boolean;
  onToggle: (itemId: string) => void;
};

const CATEGORY_STYLES = {
  base: "border-primary/30 bg-primary/5",
  addon: "border-border",
  infrastructure: "border-amber-300 bg-amber-50",
} as const;

export function ServiceItemCard({ item, selected, onToggle }: Props) {
  return (
    <button
      onClick={() => onToggle(item.id)}
      className={`relative w-full text-left p-4 rounded-sm border transition-all duration-200 ${
        selected
          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
          : CATEGORY_STYLES[item.category]
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-tight">
            {item.name}
          </p>
          {item.description && (
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-none">
          <span className="text-sm font-medium text-foreground whitespace-nowrap">
            {formatBRL(item.price)}
          </span>
          <div
            className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors duration-200 ${
              selected
                ? "bg-primary border-primary text-white"
                : "border-border bg-white"
            }`}
          >
            {selected && <Check className="w-3 h-3" />}
          </div>
        </div>
      </div>

      {item.category === "infrastructure" && (
        <span className="mt-2 inline-block text-[10px] tracking-wide uppercase text-amber-700 font-medium">
          Infraestrutura
        </span>
      )}
    </button>
  );
}
