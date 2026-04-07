"use client";

import { X } from "lucide-react";
import { motion } from "framer-motion";
import { TriggerIcon } from "@/components/triggers/icon-by-name";
import type { EvaluatedTrigger } from "@/lib/evaluate-triggers";

/**
 * floating_badge — card discreto.
 *
 * O `mode` é injetado pelo TriggerRenderer:
 * - "mobile-inflow": renderizado dentro do container fixed top do renderer.
 *   In-flow + relative. O ResizeObserver desse container ajusta a CSS var
 *   --trigger-top-bars-h que empurra o conteúdo das páginas. Sem sobreposição.
 * - "desktop-fixed": fixed bottom-6 right-6, max-w-xs. Slide-in pela direita.
 *
 * Cada `mode` é renderizado em um wrapper diferente no TriggerRenderer com
 * classes md:hidden / hidden md:block, então só uma versão é visível por vez.
 */
export function TriggerFloatingBadge({
  trigger,
  onDismiss,
  mode,
}: {
  trigger: EvaluatedTrigger;
  onDismiss: () => void;
  mode: "mobile-inflow" | "desktop-fixed";
}) {
  if (mode === "mobile-inflow") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        role="status"
      >
        <BadgeBody trigger={trigger} onDismiss={onDismiss} mobileFlow />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed z-30 bottom-6 right-6 max-w-xs"
      role="status"
    >
      <BadgeBody trigger={trigger} onDismiss={onDismiss} />
    </motion.div>
  );
}

function BadgeBody({
  trigger,
  onDismiss,
  mobileFlow = false,
}: {
  trigger: EvaluatedTrigger;
  onDismiss: () => void;
  mobileFlow?: boolean;
}) {
  const { content } = trigger;
  return (
    <div
      className={`bg-card border border-border rounded-md shadow-xl p-4 md:p-5 ${
        mobileFlow ? "mx-4" : ""
      }`}
    >
      <div className="flex gap-3">
        {content.icon && (
          <span className="shrink-0 mt-0.5">
            <TriggerIcon
              name={content.icon}
              className="size-5 text-primary/70"
            />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-display text-base text-foreground leading-tight">
            {content.title}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mt-1.5">
            {content.body}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar aviso"
          className="inline-flex items-center justify-center min-w-11 min-h-11 -mr-2 -mt-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
