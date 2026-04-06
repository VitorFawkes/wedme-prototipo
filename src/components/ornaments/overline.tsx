import { cn } from "@/lib/utils";

/**
 * Overline — texto de rótulo editorial.
 *
 * Sempre uppercase, tracking widest, em muted-foreground.
 * Usado acima de headings (ex: "CURADORIA DE CASAMENTOS").
 */
export function Overline({
  children,
  className,
  as: Component = "p",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
}) {
  return (
    <Component
      className={cn(
        "text-xs uppercase tracking-widest font-medium font-sans text-muted-foreground",
        className,
      )}
    >
      {children}
    </Component>
  );
}
