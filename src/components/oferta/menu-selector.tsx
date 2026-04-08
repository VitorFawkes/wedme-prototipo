"use client";

import { useState } from "react";
import type { ServiceItem } from "@/types";
import { formatBRL } from "@/lib/format";

type MenuTier = {
  item: ServiceItem;
  details: string[];
};

type Props = {
  menus: MenuTier[];
  selectedId: string | null;
  onSelect: (itemId: string) => void;
};

export function MenuSelector({ menus, selectedId, onSelect }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <h3 className="font-display font-medium text-lg tracking-editorial mb-4">
        Qual cardápio?
      </h3>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        {menus.map((menu, i) => (
          <button
            key={menu.item.id}
            onClick={() => setActiveTab(i)}
            className={`flex-1 min-h-11 px-4 py-3 text-sm font-medium tracking-wide transition-colors duration-200 border-b-2 -mb-px ${
              activeTab === i
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {menu.item.name.split("(")[0].trim()}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      {menus[activeTab] && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-foreground">
              {menus[activeTab].item.name}
            </p>
            <p className="text-lg font-display font-medium text-primary">
              {formatBRL(menus[activeTab].item.price)}
              <span className="text-xs text-muted-foreground ml-1">/pessoa</span>
            </p>
          </div>

          {menus[activeTab].item.description && (
            <p className="text-sm text-muted-foreground">
              {menus[activeTab].item.description}
            </p>
          )}

          <ul className="space-y-2">
            {menus[activeTab].details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary mt-0.5">•</span>
                {detail}
              </li>
            ))}
          </ul>

          <button
            onClick={() => onSelect(menus[activeTab].item.id)}
            className={`w-full min-h-11 px-6 py-3 rounded-sm text-sm font-medium tracking-wide transition-colors duration-200 ${
              selectedId === menus[activeTab].item.id
                ? "bg-primary text-primary-foreground"
                : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            {selectedId === menus[activeTab].item.id
              ? "Selecionado"
              : "Selecionar este menu"}
          </button>
        </div>
      )}
    </div>
  );
}
