import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo we.wedme — lockup oficial (símbolo "W" + wordmark).
 *
 * A altura é ligada a `1em`, então a tipografia ao redor (text-base, text-xl,
 * text-2xl, ...) controla o tamanho do logo automaticamente — basta passar a
 * mesma classe utilitária que se passaria a um <span>.
 *
 * - variant="default" → versão escura (para fundos claros)
 * - variant="light"   → versão clara (para fundos escuros)
 */
export function Logo({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "light";
}) {
  const src =
    variant === "light"
      ? "/brand/wedme-lockup-light.png"
      : "/brand/wedme-lockup-dark.png";

  return (
    <span
      className={cn(
        "inline-flex items-center leading-none select-none align-middle",
        className,
      )}
      aria-label="we.wedme"
    >
      <Image
        src={src}
        alt="we.wedme"
        width={2366}
        height={739}
        priority
        sizes="(max-width: 768px) 160px, 220px"
        className="block h-[1.75em] w-auto"
      />
    </span>
  );
}
