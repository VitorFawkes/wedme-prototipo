import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Textarea we.wedme — mobile-first.
 *
 * - text-base (16px) — previne zoom iOS
 * - rounded-sm
 * - border-border (mauve)
 * - bg-background (creme)
 * - min-h responsivo: 120px mobile, 200px desktop
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content min-h-[120px] md:min-h-[200px] w-full rounded-sm border border-border bg-background px-4 py-3 text-base font-sans text-foreground leading-relaxed placeholder:text-muted-foreground transition-colors outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive resize-none",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
