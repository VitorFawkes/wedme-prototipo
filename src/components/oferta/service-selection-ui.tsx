"use client";

import { useState, useMemo } from "react";
import type { ServiceGroup, BringYourOwnOption, CategoryFAQ, ColorPalette, CategorySlug } from "@/types";
import { ServiceItemCard } from "./service-item-card";
import { BringYourOwnSelector } from "./bring-your-own-selector";
import { ColorPaletteSelector } from "./color-palette-selector";
import { FAQSection } from "./faq-section";
import { formatBRL } from "@/lib/format";
import { useCouple } from "@/store/couple";
import { useRouter } from "next/navigation";

type Props = {
  vendorSlug: string;
  categorySlug: CategorySlug;
  services: ServiceGroup[];
  bringYourOwn?: BringYourOwnOption[];
  faq?: CategoryFAQ[];
  colorPalettes?: ColorPalette[];
};

export function ServiceSelectionUI({
  vendorSlug,
  categorySlug,
  services,
  bringYourOwn,
  faq,
  colorPalettes,
}: Props) {
  const router = useRouter();
  const addSelection = useCouple((s) => s.addSelection);

  // Get default items from all service groups
  const allDefaults = useMemo(
    () => services.flatMap((g) => g.default_items),
    [services],
  );

  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(allDefaults),
  );
  const [isBYO, setIsBYO] = useState(false);
  const [byoItems, setByoItems] = useState<Set<string>>(new Set());

  // All items flat
  const allItems = useMemo(
    () => services.flatMap((g) => g.items),
    [services],
  );

  const byoInfraItems = useMemo(
    () => bringYourOwn?.flatMap((o) => o.infrastructure_items) ?? [],
    [bringYourOwn],
  );

  // Calculate total
  const total = useMemo(() => {
    if (isBYO) {
      return byoInfraItems
        .filter((i) => byoItems.has(i.id))
        .reduce((sum, i) => sum + i.price, 0);
    }
    return allItems
      .filter((i) => selectedItems.has(i.id))
      .reduce((sum, i) => sum + i.price, 0);
  }, [isBYO, selectedItems, byoItems, allItems, byoInfraItems]);

  const hasBaseItem = useMemo(() => {
    if (isBYO) return byoItems.size > 0;
    return allItems.some((i) => i.category === "base" && selectedItems.has(i.id));
  }, [isBYO, selectedItems, byoItems, allItems]);

  function toggleItem(itemId: string) {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function toggleByoItem(itemId: string) {
    setByoItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function handleConfirm() {
    const itemIds = isBYO ? Array.from(byoItems) : Array.from(selectedItems);

    addSelection({
      category_slug: categorySlug,
      vendor_slug: vendorSlug,
      package_id: isBYO ? "bring-your-own" : services[0]?.id ?? "custom",
      quoted_price: total,
      selected_at: new Date().toISOString(),
      selected_item_ids: itemIds,
      is_bring_your_own: isBYO,
    });

    setTimeout(() => router.push("/planejamento"), 400);
  }

  // Group items by category for display
  const baseItems = allItems.filter((i) => i.category === "base");
  const addonItems = allItems.filter((i) => i.category === "addon");

  return (
    <div className="pb-28">
      {/* BYO toggle */}
      {bringYourOwn && bringYourOwn.length > 0 && (
        <BringYourOwnSelector
          options={bringYourOwn}
          isBYO={isBYO}
          onToggle={setIsBYO}
          selectedItems={byoItems}
          onToggleItem={toggleByoItem}
        />
      )}

      {/* Service items */}
      {!isBYO && (
        <div className="space-y-8">
          {services.map((group) => (
            <div key={group.id}>
              <h3 className="font-display font-medium text-lg tracking-editorial mb-2">
                {group.name}
              </h3>
              {group.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {group.description}
                </p>
              )}

              {/* Base items */}
              {baseItems.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-primary tracking-wide uppercase mb-2">
                    Escolha uma opção base
                  </p>
                  <div className="space-y-2">
                    {baseItems.map((item) => (
                      <ServiceItemCard
                        key={item.id}
                        item={item}
                        selected={selectedItems.has(item.id)}
                        onToggle={toggleItem}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Addon items */}
              {addonItems.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase mb-2">
                    Adicionais
                  </p>
                  <div className="space-y-2">
                    {addonItems.map((item) => (
                      <ServiceItemCard
                        key={item.id}
                        item={item}
                        selected={selectedItems.has(item.id)}
                        onToggle={toggleItem}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Color palette */}
      {colorPalettes && colorPalettes.length > 0 && (
        <div className="mt-8">
          <ColorPaletteSelector palettes={colorPalettes} />
        </div>
      )}

      {/* FAQ */}
      {faq && faq.length > 0 && (
        <div className="mt-10">
          <FAQSection items={faq} />
        </div>
      )}

      {/* Sticky footer with total */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-card border-t border-border px-6 py-4 safe-bottom">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-display font-medium text-foreground">
              {formatBRL(total)}
            </p>
          </div>
          <button
            onClick={handleConfirm}
            disabled={!hasBaseItem}
            className="min-h-11 px-6 py-3 rounded-sm bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-brand-wine transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            Confirmar seleção
          </button>
        </div>
      </div>
    </div>
  );
}
