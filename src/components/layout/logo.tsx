import { cn } from "@/lib/utils";

/**
 * Logo we.wedme — wordmark editorial em Cormorant Garamond.
 *
 * Sem SVG por enquanto — pura tipografia. O ponto entre "we" e "wedme"
 * é o detalhe da marca.
 */
export function Logo({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "light";
}) {
  return (
    <span
      className={cn(
        "font-display text-xl md:text-2xl font-medium tracking-editorial leading-none select-none",
        variant === "light" ? "text-white" : "text-foreground",
        className,
      )}
      aria-label="we.wedme"
    >
      we<span className="text-[color:var(--brand-rose)]">.</span>wedme
    </span>
  );
}
