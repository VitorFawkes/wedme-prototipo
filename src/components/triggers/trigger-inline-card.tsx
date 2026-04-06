"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { TriggerIcon } from "@/components/triggers/icon-by-name";
import { cn } from "@/lib/utils";
import type { EvaluatedTrigger } from "@/lib/evaluate-triggers";

/**
 * inline_card — card padrão com borda lateral primary, entre seções.
 *
 * Estilos:
 * - subtle: texto muted, borda sutil
 * - normal: texto foreground, borda normal
 * - prominent: bg-primary text-primary-foreground (chama mais atenção)
 */
export function TriggerInlineCard({
  trigger,
  onDismiss,
}: {
  trigger: EvaluatedTrigger;
  onDismiss: () => void;
}) {
  const { rule, content } = trigger;
  const isProminent = rule.style === "prominent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative rounded-md border border-l-4 p-5 md:p-6 shadow-sm",
        isProminent
          ? "bg-primary text-primary-foreground border-primary border-l-[color:var(--brand-rose)]"
          : "bg-card text-foreground border-border border-l-primary",
      )}
      role="status"
    >
      <div className="flex gap-3 md:gap-4">
        {content.icon && (
          <span
            className={cn(
              "shrink-0 mt-0.5",
              isProminent ? "text-primary-foreground" : "text-primary",
            )}
          >
            <TriggerIcon name={content.icon} className="size-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "font-display font-medium tracking-editorial leading-tight",
              isProminent
                ? "text-xl md:text-2xl"
                : rule.style === "subtle"
                  ? "text-base md:text-lg"
                  : "text-lg md:text-xl",
            )}
          >
            {content.title}
          </h3>
          <p
            className={cn(
              "text-sm md:text-base mt-2 leading-relaxed font-sans",
              isProminent
                ? "text-primary-foreground/90"
                : rule.style === "subtle"
                  ? "text-muted-foreground"
                  : "text-foreground",
            )}
          >
            {content.body}
          </p>
          {content.cta_text && content.cta_href && (
            <Link
              href={content.cta_href}
              className={cn(
                "inline-flex items-center justify-center min-h-11 px-5 mt-4 rounded-sm text-sm font-medium tracking-wide transition-colors duration-200",
                isProminent
                  ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  : "bg-primary text-primary-foreground hover:bg-brand-wine",
              )}
            >
              {content.cta_text}
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar"
          className={cn(
            "inline-flex items-center justify-center min-w-11 min-h-11 -mr-2 -mt-2 transition-colors",
            isProminent
              ? "text-primary-foreground/70 hover:text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <X className="size-4" />
        </button>
      </div>
    </motion.div>
  );
}
