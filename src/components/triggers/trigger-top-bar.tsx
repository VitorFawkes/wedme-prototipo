"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { TriggerIcon } from "@/components/triggers/icon-by-name";
import type { EvaluatedTrigger } from "@/lib/evaluate-triggers";

/**
 * top_bar — faixa full-width acima do conteúdo.
 *
 * Layout mobile: vertical (ícone+título numa linha, body abaixo, CTA full-width)
 * Layout desktop: horizontal (tudo lado a lado)
 */
export function TriggerTopBar({
  trigger,
  onDismiss,
}: {
  trigger: EvaluatedTrigger;
  onDismiss: () => void;
}) {
  const { content } = trigger;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-primary/5 border-b border-primary/20 safe-px"
      role="status"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
          {content.icon && (
            <span className="shrink-0 mt-0.5 md:mt-0">
              <TriggerIcon
                name={content.icon}
                className="size-5 text-primary"
              />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display text-base md:text-lg text-foreground leading-tight">
              {content.title}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
              {content.body}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {content.cta_text && content.cta_href && (
            <Link
              href={content.cta_href}
              className="inline-flex items-center justify-center min-h-11 px-4 md:px-5 rounded-sm bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-brand-wine transition-colors duration-200 w-full md:w-auto"
            >
              {content.cta_text}
            </Link>
          )}
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Fechar aviso"
            className="inline-flex items-center justify-center min-w-11 min-h-11 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
