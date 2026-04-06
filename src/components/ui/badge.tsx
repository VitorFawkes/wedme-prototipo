import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge we.wedme — discreto, editorial.
 *
 * - rounded-sm (NUNCA rounded-full)
 * - bg-primary/10 text-primary no padrão
 * - tracking-wide
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-sm border border-transparent px-2.5 py-1 text-xs font-medium tracking-wide whitespace-nowrap [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        muted: "bg-muted text-foreground",
        outline: "border-border bg-transparent text-foreground",
        verified:
          "bg-background/90 text-foreground border-border backdrop-blur-sm",
        success:
          "bg-foreground/5 text-foreground border-foreground/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
