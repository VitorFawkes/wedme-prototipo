import type { CategorySlug, ProfileSlug, Selection, Vendor } from "@/types";
import { profiles } from "@/data/profiles";
import { categories } from "@/data/categories";
import { venues } from "@/data/venues";
import { vendors } from "@/data/vendors";

/**
 * Helpers puros (testáveis) para derivar dados do estado do casal.
 *
 * Recebem dados como parâmetros, não acessam o store diretamente.
 */

// ============================================================
// Slug do casal (URL do site do casamento)
// ============================================================

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getCoupleSlug(
  partner1: string | null,
  partner2: string | null,
): string {
  const a = slugify(partner1 ?? "noivo");
  const b = slugify(partner2 ?? "noiva");
  return `${a}-${b}`;
}

// ============================================================
// Cálculos financeiros
// ============================================================

export function getTotalConfirmed(selections: Selection[]): number {
  return selections.reduce((sum, s) => sum + s.quoted_price, 0);
}

export function getRemainingBudget(
  budget: number | null,
  selections: Selection[],
): number {
  if (!budget) return 0;
  return Math.max(0, budget - getTotalConfirmed(selections));
}

// ============================================================
// Caminho personalizado por perfil
// ============================================================

export function getCategoriesOfPath(
  profileSlug: ProfileSlug | null,
): readonly CategorySlug[] {
  if (!profileSlug) {
    // Fallback: ordem padrão completa
    return categories.map((c) => c.slug);
  }
  const profile = profiles.find((p) => p.slug === profileSlug);
  return profile?.default_path_categories ?? categories.map((c) => c.slug);
}

export function getProgressPercent(
  selections: Selection[],
  profileSlug: ProfileSlug | null,
): number {
  const path = getCategoriesOfPath(profileSlug);
  if (path.length === 0) return 0;
  const selectedCount = selections.filter((s) =>
    path.includes(s.category_slug),
  ).length;
  return Math.round((selectedCount / path.length) * 100);
}

export function getCategoriesPending(
  selections: Selection[],
  profileSlug: ProfileSlug | null,
  skipped: CategorySlug[],
): readonly CategorySlug[] {
  const path = getCategoriesOfPath(profileSlug);
  return path.filter(
    (cat) =>
      !selections.some((s) => s.category_slug === cat) &&
      !skipped.includes(cat),
  );
}

// ============================================================
// Helpers de tempo
// ============================================================

export function daysSinceOnboarding(
  startedAt: string | null | undefined,
): number {
  if (!startedAt) return 0;
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

// ============================================================
// Lookup unificado de profissional/venue por slug
// ============================================================

export function getVendorOrVenueBySlug(slug: string): Vendor | undefined {
  return (
    venues.find((v) => v.slug === slug) ?? vendors.find((v) => v.slug === slug)
  );
}

/**
 * Retorna todos os profissionais de uma categoria. Para `local`, retorna
 * os 13 venues Welucci. Para outras categorias, retorna os vendors mockados.
 */
export function getProvidersByCategory(
  categorySlug: CategorySlug,
): readonly Vendor[] {
  if (categorySlug === "local") {
    return venues;
  }
  return vendors.filter((v) => v.category === categorySlug);
}

// ============================================================
// Ordenação determinística (para consistência de "primeiro/segundo do grid")
// ============================================================

/**
 * Cria uma seed determinística a partir de string. Usado para ordenar
 * vendors de forma consistente por (profile + category) — assim o gatilho #4
 * sempre cita o "segundo profissional do grid" de forma estável.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Calcula o score de "afinidade" de um vendor com o casal.
 *
 * Quanto maior o score, mais alto ele aparece na lista. Combina 3 sinais:
 *
 * 1. **example_venues do perfil** (peso 100): se o perfil do casal lista
 *    explicitamente esse vendor como exemplo, ele vai pro topo.
 * 2. **dream keywords match** (peso 30 por keyword): se o texto do sonho
 *    do casal contém palavras que aparecem na bio/tagline/highlights do
 *    vendor, soma. Ex: dream menciona "praia" → vendors cuja bio menciona
 *    "praia"/"areia"/"mar" sobem.
 * 3. **city/region match** (peso 50): se o casal disse que quer casar
 *    em "Ilhabela" ou "praia em SP", vendors cuja city é Ilhabela ou
 *    cuja highlights menciona praia/litoral sobem.
 * 4. **tiebreaker determinístico** (peso 0-10): hash estável pra que a
 *    ordem nunca mude entre renders.
 */
function scoreVendor(
  vendor: Vendor,
  profile: (typeof profiles)[number] | undefined,
  dreamText: string | null,
  city: string | null,
  seed: string,
): number {
  let score = 0;

  // 1. Example venues do perfil
  if (profile?.example_venues.includes(vendor.slug)) {
    score += 100;
  }

  // 2. Dream text match (inteligente)
  // Em vez de lista fixa de keywords, extrai palavras significativas
  // do que o casal disse e cruza com o conteúdo do vendor.
  // Isso captura qualquer termo que o casal use naturalmente.
  if (dreamText && dreamText.length > 0) {
    const normalize = (s: string) =>
      s.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const dreamNorm = normalize(dreamText);
    const haystackNorm = normalize(
      [vendor.tagline, vendor.bio, ...(vendor.highlights ?? []), vendor.name].join(" ")
    );

    // Palavras sem significado (stopwords) que não devem contar como match
    const STOPWORDS = new Set([
      "que", "com", "para", "por", "uma", "uns", "dos", "das", "nos", "nas",
      "mas", "mais", "muito", "como", "ser", "ter", "foi", "vai", "vou",
      "isso", "isso", "este", "essa", "esse", "dele", "dela", "eles", "elas",
      "meu", "minha", "seu", "sua", "nosso", "nossa", "todo", "toda", "todos",
      "cada", "onde", "quando", "quem", "porque", "pois", "ate", "sem", "num",
      "nao", "sim", "bem", "mal", "ainda", "tambem", "depois", "antes",
      "sobre", "entre", "desde", "pode", "quer", "gente", "voces", "dia",
    ]);

    // Extrai palavras do dream com 4+ caracteres e que não são stopwords
    const dreamWords = dreamNorm.split(" ")
      .filter((w) => w.length >= 4 && !STOPWORDS.has(w));

    // Conta quantas palavras do dream aparecem no vendor
    let matches = 0;
    for (const word of dreamWords) {
      if (haystackNorm.includes(word)) {
        matches++;
      }
    }

    // Pontuação proporcional: cada match vale 20, máximo 120
    score += Math.min(matches * 20, 120);
  }

  // 3. City/region match
  if (city) {
    const cityLower = city.toLowerCase();
    const vendorCityLower = vendor.city.toLowerCase();
    const highlightsLower = (vendor.highlights ?? [])
      .join(" ")
      .toLowerCase();
    const taglineLower = vendor.tagline.toLowerCase();

    // Match exato de cidade
    if (vendorCityLower.includes(cityLower) || cityLower.includes(vendorCityLower)) {
      score += 50;
    }

    // "Praia" / "litoral" no city do casal → boost forte para vendors com sinais de praia
    if (
      /praia|litoral|mar|areia/.test(cityLower) &&
      /praia|litoral|mar|areia|deck|pernambuco|guarujá|guaruja|ilhabela|ubatuba|ocean/.test(
        vendorCityLower + " " + highlightsLower + " " + taglineLower,
      )
    ) {
      score += 200;
    }

    // "Campo" / "interior" / "sítio" → boost forte para vendors interior
    if (
      /campo|interior|sítio|sitio|fazenda/.test(cityLower) &&
      /campo|interior|colonial|fazenda|sítio|sitio|jardim|verde|área verde/.test(
        vendorCityLower + " " + highlightsLower + " " + taglineLower,
      )
    ) {
      score += 200;
    }
  }

  // 4. Tiebreaker determinístico (sempre adiciona algum valor entre 0-10)
  score += (hashString(vendor.slug + seed) % 11);

  return score;
}

export function sortVendorsForProfile(
  vendorList: readonly Vendor[],
  profileSlug: ProfileSlug | null,
  categorySlug: CategorySlug,
  dreamText: string | null = null,
  city: string | null = null,
): readonly Vendor[] {
  if (!profileSlug) return vendorList;

  const profile = profiles.find((p) => p.slug === profileSlug);
  if (!profile) return vendorList;

  const seed = `${profileSlug}-${categorySlug}`;

  return [...vendorList].sort((a, b) => {
    const scoreA = scoreVendor(a, profile, dreamText, city, seed);
    const scoreB = scoreVendor(b, profile, dreamText, city, seed);
    return scoreB - scoreA; // descendente: maior score primeiro
  });
}
