"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCouple } from "@/store/couple";

/**
 * /comece/sonho — Página de fallback/redirect.
 *
 * O fluxo do sonho agora é integrado no chat em /comece.
 * Esta página só redireciona:
 * - Se tem perfil → /planejamento
 * - Se não → /comece
 */
export default function SonhoPage() {
  const router = useRouter();
  const wedding_profile_slug = useCouple((s) => s.wedding_profile_slug);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      if (wedding_profile_slug) {
        router.replace("/planejamento");
      } else {
        router.replace("/comece");
      }
    }
  }, [hydrated, wedding_profile_slug, router]);

  return (
    <main className="min-h-dvh flex items-center justify-center">
      <p className="text-muted-foreground">Carregando…</p>
    </main>
  );
}
