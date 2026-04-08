"use client";

import { ExternalLink } from "lucide-react";
import type { BringYourOwnOption } from "@/types";
import { ServiceItemCard } from "./service-item-card";

type Props = {
  options: BringYourOwnOption[];
  isBYO: boolean;
  onToggle: (isBYO: boolean) => void;
  selectedItems: Set<string>;
  onToggleItem: (itemId: string) => void;
};

export function BringYourOwnSelector({
  options,
  isBYO,
  onToggle,
  selectedItems,
  onToggleItem,
}: Props) {
  return (
    <div className="mb-8">
      {/* Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => onToggle(false)}
          className={`flex-1 min-h-11 px-4 py-3 rounded-sm text-sm font-medium tracking-wide transition-colors duration-200 ${
            !isBYO
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-accent"
          }`}
        >
          Selecionar do catálogo
        </button>
        <button
          onClick={() => onToggle(true)}
          className={`flex-1 min-h-11 px-4 py-3 rounded-sm text-sm font-medium tracking-wide transition-colors duration-200 flex items-center justify-center gap-2 ${
            isBYO
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-accent"
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          Trazer de fora
        </button>
      </div>

      {/* BYO infrastructure items */}
      {isBYO && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Você pode trazer seu próprio fornecedor. Selecione a infraestrutura necessária:
          </p>
          {options.map((option) => (
            <div key={option.id}>
              <p className="text-xs font-medium text-amber-700 tracking-wide uppercase mb-2">
                {option.label}
              </p>
              <div className="space-y-2">
                {option.infrastructure_items.map((item) => (
                  <ServiceItemCard
                    key={item.id}
                    item={item}
                    selected={selectedItems.has(item.id)}
                    onToggle={onToggleItem}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
