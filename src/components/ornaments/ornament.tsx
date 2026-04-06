import { cn } from "@/lib/utils";

/**
 * Ornamento isolado em rose — losango ◇ usado entre seções,
 * acima de heroes, dentro de loadings cinematográficos.
 */

const SIZE_CLASSES = {
  sm: "text-base",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
} as const;

export function Ornament({
  size = "md",
  className,
  pulse = false,
}: {
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-block leading-none select-none text-[color:var(--brand-rose)]",
        SIZE_CLASSES[size],
        pulse && "animate-pulse-ornament",
        className,
      )}
      aria-hidden="true"
    >
      ◇
    </span>
  );
}
