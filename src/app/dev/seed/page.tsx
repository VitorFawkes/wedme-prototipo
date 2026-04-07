"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCouple } from "@/store/couple";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { Overline } from "@/components/ornaments/overline";
import { profiles } from "@/data/profiles";
import { venues } from "@/data/venues";
import { vendors } from "@/data/vendors";
import type { ProfileSlug } from "@/types";

/**
 * /dev/seed — atalho de QA pra carregar uma sessão de casal mockada.
 *
 * Útil para testar páginas profundas (/oferta, /casamento, /checkout) sem
 * precisar refazer o onboarding manualmente. NÃO É uma rota de produção —
 * fica em /dev/seed pra ficar claro que é só pra desenvolvimento.
 */

const SCENARIOS = [
  {
    id: "intimo-pronto",
    label: "Casal Íntimo & Emocional pronto pra checkout",
    description: "Ana & Pedro, Ilhabela, 3 escolhas (local + foto + buffet)",
    profile: "intimo-emocional" as ProfileSlug,
    selections: ["welucci-sansu", "marina-arruda-weddings", "ana-castello-buffet"],
  },
  {
    id: "classico-comecando",
    label: "Casal Clássico Atemporal começando",
    description: "Maria & Lucas, São Paulo, sem escolhas ainda",
    profile: "classico-atemporal" as ProfileSlug,
    selections: [],
  },
  {
    id: "natureza-meio",
    label: "Casal Natureza & Ar Livre no meio",
    description: "Júlia & Rafael, Trancoso, 2 escolhas",
    profile: "natureza-ar-livre" as ProfileSlug,
    selections: ["welucci-fontana", "vila-floral-design"],
  },
  {
    id: "grande-quase",
    label: "Casal Grande Celebração quase fechando",
    description: "Vanessa & Eduardo, SP, 5 escolhas",
    profile: "grande-celebracao" as ProfileSlug,
    selections: [
      "welucci-estaiada",
      "estudio-matheus-couto",
      "fratelli-eventos",
      "dj-thiago-prado",
      "studio-leila-fontes",
    ],
  },
] as const;

const SCENARIO_DATA: Record<
  (typeof SCENARIOS)[number]["id"],
  {
    p1: string;
    p2: string;
    date: string;
    city: string;
    state: string;
    budget: number;
    guests: number;
    dream: string;
    intents: string[];
    danceSong: string | null;
    howMet: string | null;
  }
> = {
  "intimo-pronto": {
    p1: "Ana",
    p2: "Pedro",
    date: "2027-02-14",
    city: "Ilhabela",
    state: "SP",
    budget: 80000,
    guests: 70,
    dream:
      "Queremos um casamento íntimo ao entardecer, pé na areia, com a família mais próxima. O pôr do sol em Ilhabela é tudo o que sonhamos.",
    intents: ["íntimo", "entardecer", "praia"],
    danceSong: "At Last, Etta James",
    howMet:
      "A gente se conheceu numa festa de aniversário em 2021. Foi tímido no início, mas três semanas depois não saíamos mais um do lado do outro.",
  },
  "classico-comecando": {
    p1: "Maria",
    p2: "Lucas",
    date: "2027-09-12",
    city: "São Paulo",
    state: "SP",
    budget: 180000,
    guests: 220,
    dream:
      "Sonhamos com um casamento tradicional, formal, na igreja, com a família reunida. Os pais sempre nos disseram que a tradição importa.",
    intents: ["tradição", "família", "igreja"],
    danceSong: null,
    howMet: null,
  },
  "natureza-meio": {
    p1: "Júlia",
    p2: "Rafael",
    date: "2027-04-22",
    city: "Trancoso",
    state: "BA",
    budget: 120000,
    guests: 100,
    dream:
      "A gente sonha com um destination wedding em Trancoso. Pé na areia, sem firulas, comida boa e o pôr do sol como cenário.",
    intents: ["destination", "praia", "natureza"],
    danceSong: "Águas de Março, Tom Jobim",
    howMet: null,
  },
  "grande-quase": {
    p1: "Vanessa",
    p2: "Eduardo",
    date: "2027-06-05",
    city: "São Paulo",
    state: "SP",
    budget: 350000,
    guests: 350,
    dream:
      "Queremos uma grande celebração com todos que a gente ama. Festa até o sol nascer, pista lotada, comida farta, banda ao vivo. Que vire história.",
    intents: ["festa", "muitos convidados", "música"],
    danceSong: "Evidências, Chitãozinho & Xororó",
    howMet:
      "Nos conhecemos na faculdade em 2018. Demoramos dois anos pra conversar de verdade. Depois disso foi tudo muito rápido.",
  },
};

const VENDOR_PRICES: Record<string, { pkg: string; price: number }> = {
  // Venues (categoria local)
  ...Object.fromEntries(
    venues.map((v) => [
      v.slug,
      { pkg: v.packages[0].id, price: v.packages[0].price },
    ]),
  ),
  // Vendors (outras categorias)
  ...Object.fromEntries(
    vendors.map((v) => [
      v.slug,
      { pkg: v.packages[0].id, price: v.packages[0].price },
    ]),
  ),
};

function categoryOf(slug: string): string {
  const v =
    venues.find((x) => x.slug === slug) ?? vendors.find((x) => x.slug === slug);
  return v?.category ?? "local";
}

export default function DevSeedPage() {
  const router = useRouter();
  const reset = useCouple((s) => s.reset);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  function loadScenario(scenarioId: (typeof SCENARIOS)[number]["id"]) {
    const data = SCENARIO_DATA[scenarioId];
    const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
    reset();

    // Aplica os campos
    useCouple.setState((state) => ({
      ...state,
      partner_1_name: data.p1,
      partner_2_name: data.p2,
      wedding_date: data.date,
      city: data.city,
      state: data.state,
      estimated_budget: data.budget,
      guest_count: data.guests,
      phone: "11 99999-0000",
      onboarding_complete: true,
      dream_text: data.dream,
      wedding_profile_slug: scenario.profile,
      detected_intents: data.intents.slice(),
      profile_confidence: 0.9,
      dance_song: data.danceSong,
      how_they_met: data.howMet,
      journey_status: "exploring",
      journey_started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      selections: scenario.selections.map((slug) => {
        const info = VENDOR_PRICES[slug];
        return {
          category_slug: categoryOf(slug),
          vendor_slug: slug,
          package_id: info?.pkg ?? "essencial",
          quoted_price: info?.price ?? 0,
          selected_at: new Date().toISOString(),
        };
      }) as never,
    }));

    setTimeout(() => router.push("/meu-casamento"), 100);
  }

  if (!hydrated) return null;

  return (
    <main className="min-h-dvh bg-background safe-px safe-top safe-bottom px-4 md:px-12 py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <Logo className="text-3xl md:text-4xl mb-4" />
          <Overline className="mb-2">Atalho de QA</Overline>
          <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground tracking-editorial leading-tight">
            Carregar sessão mockada
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-3 leading-relaxed max-w-xl mx-auto">
            Atalho de desenvolvimento para testar páginas internas sem refazer o
            onboarding. Escolha um cenário pra carregar tudo de uma vez.
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          {SCENARIOS.map((s) => {
            const profile = profiles.find((p) => p.slug === s.profile);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => loadScenario(s.id)}
                className="w-full text-left bg-card border border-border hover:border-primary rounded-md p-5 md:p-6 transition-colors group"
              >
                <Overline className="mb-1.5">{profile?.name}</Overline>
                <h2 className="font-display text-xl md:text-2xl text-foreground tracking-editorial leading-tight mb-1.5">
                  {s.label}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.description}
                </p>
                <p className="text-xs text-primary font-medium tracking-wide mt-3 group-hover:underline">
                  Carregar →
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              reset();
              setTimeout(() => router.push("/"), 50);
            }}
          >
            Limpar tudo e voltar à home
          </Button>
          <Link
            href="/comece"
            className="inline-flex items-center justify-center min-h-11 px-6 rounded-sm text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Começar do zero (real)
          </Link>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-10 tracking-wide italic">
          Esta página é só pra desenvolvimento. Não fica visível em produção.
        </p>
      </div>
    </main>
  );
}
