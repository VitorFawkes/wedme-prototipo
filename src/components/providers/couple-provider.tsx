"use client";

import { useEffect, useState } from "react";
import { useCouple } from "@/store/couple";

/**
 * Garante a hidratação do Zustand+localStorage no Next 16 App Router.
 *
 * O store é criado com `skipHydration: true` em src/store/couple.ts. Aqui
 * forçamos a rehydratação no client após o mount, evitando hydration mismatch
 * entre Server Components e Client Components.
 */
export function CoupleProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useCouple.persist.rehydrate();
    setHydrated(true);
  }, []);

  // Renderiza os children imediatamente — o estado pré-hidratação
  // mostra os defaults (tudo null/[]), o que é seguro para SSR.
  // Componentes que dependem do estado podem checar `hydrated` se precisarem.
  return <>{children}</>;
}
