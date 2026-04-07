"use client";

import { X } from "lucide-react";
import { motion } from "framer-motion";
import { TriggerIcon } from "@/components/triggers/icon-by-name";
import type { EvaluatedTrigger } from "@/lib/evaluate-triggers";

/**
 * floating_badge — card discreto.
 *
 * - **Mobile**: renderizado DENTRO do container `#trigger-top-bars` (in-flow,
 *   relative). O ResizeObserver desse container já ajusta a CSS var
 *   `--trigger-top-bars-h` que empurra o conteúdo das páginas. Assim o badge
 *   nunca sobrepõe inline cards nem o conteúdo do hero.
 * - **Desktop**: fixed bottom-6 right-6 (canto inferior direito), porque há
 *   espaço de sobra e fica visualmente menos intrusivo.
 *
 * Render dual: o componente devolve dois elementos (mobile e desktop),
 * cada um com classes `md:hidden` ou `hidden md:block`. Só um aparece.
 */
export function TriggerFloatingBadge({
  trigger,
  onDismiss,
}: {
  trigger: EvaluatedTrigger;
  onDismiss: () => void;
}) {
  return (
    <>
      {/* Mobile: in-flow no topo (dentro do trigger-top-bars container) */}
      <div className="md:hidden">
        <BadgeBody trigger={trigger} onDismiss={onDismiss} />
      </div>
      {/* Desktop: fixed bottom-right */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:block fixed z-30 bottom-6 right-6 max-w-xs"
        role="status"
      >
        <BadgeBody trigger={trigger} onDismiss={onDismiss} />
      </motion.div>
    </>
  );
}

function BadgeBody({
  trigger,
  onDismiss,
}: {
  trigger: EvaluatedTrigger;
  onDismiss: () => void;
}) {
  const { content } = trigger;
  return (
    <div className="bg-card border border-border rounded-md shadow-xl p-4 md:p-5 mx-4 md:mx-0">
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
