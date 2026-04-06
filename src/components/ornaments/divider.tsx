import { cn } from "@/lib/utils";

/**
 * Divisor decorativo entre seções heroicas (briefing §3.4).
 *
 * Linha horizontal mauve + losango ◇ rose centralizado.
 * Padding vertical responsivo (my-8 mobile, my-12 desktop).
 */
export function Divider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 my-8 md:my-12 px-6 md:px-0",
        className,
      )}
      role="separator"
      aria-orientation="horizontal"
    >
      <div className="flex-1 h-px bg-border" />
      <span
        className="text-[color:var(--brand-rose)] text-lg leading-none select-none"
        aria-hidden="true"
      >
        ◇
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
