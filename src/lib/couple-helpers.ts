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

export function sortVendorsForProfile(
  vendorList: readonly Vendor[],
  profileSlug: ProfileSlug | null,
  categorySlug: CategorySlug,
): readonly Vendor[] {
  if (!profileSlug) return vendorList;

  const profile = profiles.find((p) => p.slug === profileSlug);
  if (!profile) return vendorList;

  // Primeiro: priorizar example_venues do perfil (especialmente para `local`)
  const exampleSlugs = profile.example_venues;

  return [...vendorList].sort((a, b) => {
    const aIsExample = exampleSlugs.includes(a.slug);
    const bIsExample = exampleSlugs.includes(b.slug);
    if (aIsExample && !bIsExample) return -1;
    if (!aIsExample && bIsExample) return 1;

    // Tiebreaker determinístico via hash do slug + perfil + categoria
    const seed = `${profileSlug}-${categorySlug}`;
    const aScore = hashString(a.slug + seed);
    const bScore = hashString(b.slug + seed);
    return aScore - bScore;
  });
}
