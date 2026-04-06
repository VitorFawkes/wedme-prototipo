import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Botão we.wedme — mobile-first.
 *
 * Regras inviolaveis:
 * - rounded-sm (NUNCA rounded-full em CTA)
 * - font-medium (NUNCA font-bold)
 * - tracking-wide para sentir editorial
 * - min-h-11 (44px touch target — Apple HIG)
 * - text-sm padrão, text-base no `lg`
 * - transitions duration-200
 * - hover bg-brand-wine no primary
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-sm font-sans font-medium tracking-wide whitespace-nowrap transition-colors duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-brand-wine active:bg-brand-wine",
        outline:
          "border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        ghost:
          "bg-transparent text-foreground hover:text-primary hover:bg-accent/50",
        muted:
          "bg-muted text-foreground hover:bg-accent",
        link:
          "text-primary underline-offset-4 hover:underline px-0 py-0 min-h-0",
      },
      size: {
        // sm: usado em chips/inline (ex: links em listas) — ainda 44px de altura para touch
        sm: "min-h-11 text-xs px-4 py-2",
        // md (padrão): CTAs principais
        md: "min-h-11 text-sm px-6 py-3 md:px-7 md:py-3.5",
        // lg: heros, checkout final
        lg: "min-h-14 text-base px-8 py-4 md:py-5",
        // icon: botões só com ícone — quadrado, mas ≥44px
        icon: "size-11 p-0",
        // icon-sm: ainda 44px (touch), mas para uso em headers compactos
        "icon-sm": "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
