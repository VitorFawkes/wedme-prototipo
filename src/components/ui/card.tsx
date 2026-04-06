import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Card we.wedme — editorial, com hover sutil e active state pra mobile.
 *
 * - rounded-md (não rounded-xl como shadcn default)
 * - border border-border (mauve)
 * - hover:shadow-lg + active:scale-[0.99] (touch feedback)
 * - duration-300 nas transições
 */

function Card({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "group/card flex flex-col overflow-hidden rounded-md border border-border bg-card text-card-foreground transition-shadow duration-300 hover:shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1 p-5 md:p-6", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "font-display text-xl md:text-2xl font-medium leading-tight tracking-editorial",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn(
        "text-sm font-sans text-muted-foreground leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 md:px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-3 p-5 md:p-6 mt-auto",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
