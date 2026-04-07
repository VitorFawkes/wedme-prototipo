"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useCouple } from "@/store/couple";
import {
  evaluateTriggers,
  type EvaluatedTrigger,
} from "@/lib/evaluate-triggers";
import { TriggerTopBar } from "./trigger-top-bar";
import { TriggerInlineCard } from "./trigger-inline-card";
import { TriggerFloatingBadge } from "./trigger-floating-badge";
import { TriggerModal } from "./trigger-modal";

/**
 * Avalia os gatilhos do casal contra a rota atual e renderiza:
 * - top_bar acima do conteúdo
 * - floating_badge fixed bottom
 * - modal full overlay
 *
 * inline_card NÃO é renderizado por aqui — as páginas controlam onde
 * eles aparecem no fluxo. Use `useTriggers({ position: 'inline_card' })`
 * para obter a lista e renderizar manualmente.
 */
export function TriggerRenderer() {
  const triggers = useTriggers();
  const dismiss = useCouple((s) => s.dismissTrigger);
  const markFired = useCouple((s) => s.markTriggerFired);

  const topBars = triggers.filter((t) => t.rule.position === "top_bar");
  const badges = triggers.filter((t) => t.rule.position === "floating_badge");
  const modals = triggers.filter((t) => t.rule.position === "modal");

  // Marca os "once" como fired assim que aparecem (idempotente)
  useEffect(() => {
    triggers.forEach((t) => {
      if (t.rule.once) markFired(t.rule.slug);
    });
  }, [triggers, markFired]);

  return (
    <>
      {/* Top bars stackam acima */}
      {topBars.length > 0 && (
        <div className="fixed top-12 md:top-14 left-0 right-0 z-30 safe-top">
          <AnimatePresence>
            {topBars.map((t) => (
              <TriggerTopBar
                key={t.rule.slug}
                trigger={t}
                onDismiss={() => dismiss(t.rule.slug)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Floating badges (max 1 visível por vez) */}
      <AnimatePresence>
        {badges.slice(0, 1).map((t) => (
          <TriggerFloatingBadge
            key={t.rule.slug}
            trigger={t}
            onDismiss={() => dismiss(t.rule.slug)}
          />
        ))}
      </AnimatePresence>

      {/* Modais (max 1) */}
      {modals.slice(0, 1).map((t) => (
        <TriggerModal
          key={t.rule.slug}
          trigger={t}
          onDismiss={() => dismiss(t.rule.slug)}
        />
      ))}
    </>
  );
}

/**
 * Hook para obter triggers avaliados — útil para `inline_card` que
 * é renderizado dentro do fluxo da página.
 */
export function useTriggers(filter?: {
  position?: "top_bar" | "inline_card" | "floating_badge" | "modal";
}): readonly EvaluatedTrigger[] {
  const pathname = usePathname();

  // Selecionar campos relevantes do store de forma seletiva (Zustand fast path)
  const partner_1_name = useCouple((s) => s.partner_1_name);
  const partner_2_name = useCouple((s) => s.partner_2_name);
  const city = useCouple((s) => s.city);
  const state = useCouple((s) => s.state);
  const wedding_date = useCouple((s) => s.wedding_date);
  const estimated_budget = useCouple((s) => s.estimated_budget);
  const guest_count = useCouple((s) => s.guest_count);
  const wedding_profile_slug = useCouple((s) => s.wedding_profile_slug);
  const selections = useCouple((s) => s.selections);
  const skipped_categories = useCouple((s) => s.skipped_categories);
  const dismissed_triggers = useCouple((s) => s.dismissed_triggers);
  const fired_once_triggers = useCouple((s) => s.fired_once_triggers);
  const journey_started_at = useCouple((s) => s.journey_started_at);

  return useMemo(() => {
    const all = evaluateTriggers({
      partner_1_name,
      partner_2_name,
      city,
      state,
      wedding_date,
      estimated_budget,
      guest_count,
      wedding_profile_slug,
      selections,
      skipped_categories,
      dismissed_triggers,
      fired_once_triggers,
      journey_started_at,
      pathname,
    });
    if (filter?.position) {
      return all.filter((t) => t.rule.position === filter.position);
    }
    return all;
  }, [
    partner_1_name,
    partner_2_name,
    city,
    state,
    wedding_date,
    estimated_budget,
    guest_count,
    wedding_profile_slug,
    selections,
    skipped_categories,
    dismissed_triggers,
    fired_once_triggers,
    journey_started_at,
    pathname,
    filter?.position,
  ]);
}

/**
 * Helper para usar inline_card dentro de páginas:
 *
 * ```tsx
 * const { triggers, dismiss } = useInlineTriggers()
 * return (
 *   <div>
 *     {triggers.map(t => <TriggerInlineCard key={t.rule.slug} trigger={t} onDismiss={() => dismiss(t.rule.slug)} />)}
 *   </div>
 * )
 * ```
 */
export function useInlineTriggers() {
  const triggers = useTriggers({ position: "inline_card" });
  const dismiss = useCouple((s) => s.dismissTrigger);
  const markFired = useCouple((s) => s.markTriggerFired);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    triggers.forEach((t) => {
      if (t.rule.once) markFired(t.rule.slug);
    });
  }, [triggers, mounted, markFired]);

  return { triggers: mounted ? triggers : [], dismiss };
}
