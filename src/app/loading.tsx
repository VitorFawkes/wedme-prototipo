import { Ornament } from "@/components/ornaments/ornament";

/**
 * Loading global do App Router. Acolhedor — não técnico.
 */
export default function Loading() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-background safe-px">
      <Ornament size="xl" pulse />
      <p className="font-display text-xl md:text-2xl text-muted-foreground tracking-editorial mt-6">
        Um momento…
      </p>
    </main>
  );
}
