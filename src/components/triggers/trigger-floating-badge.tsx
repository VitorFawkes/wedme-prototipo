"use client";

import { X } from "lucide-react";
import { motion } from "framer-motion";
import { TriggerIcon } from "@/components/triggers/icon-by-name";
import type { EvaluatedTrigger } from "@/lib/evaluate-triggers";

/**
 * floating_badge — card discreto fixed.
 *
 * Mobile: bottom-20 left-4 right-4 (acima do rodapé sticky, full-width)
 * Desktop: bottom-6 right-6 max-w-xs
 *
 * Slide-in pela direita, X grande pra fechar.
 */
export function TriggerFloatingBadge({
  trigger,
  onDismiss,
}: {
  trigger: EvaluatedTrigger;
  onDismiss: () => void;
}) {
  const { content } = trigger;
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed z-30 safe-bottom bottom-20 left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:max-w-xs"
      role="status"
    >
      <div className="bg-card border border-border rounded-md shadow-xl p-4 md:p-5">
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
    </motion.div>
  );
}
