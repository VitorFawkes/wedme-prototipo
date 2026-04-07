import type {
  CategorySlug,
  ProfileSlug,
  Selection,
  TriggerCondition,
  TriggerRule,
} from "@/types";
import { triggers as allTriggers } from "@/data/triggers";
import { profiles } from "@/data/profiles";
import { categories } from "@/data/categories";
import {
  getCategoriesPending,
  getCategoriesOfPath,
  getProvidersByCategory,
  getTotalConfirmed,
  getVendorOrVenueBySlug,
  sortVendorsForProfile,
} from "@/lib/couple-helpers";
import { formatBRL, formatDateExtended } from "@/lib/format";

/**
 * Hash determinístico de string para gerar números "aleatórios" estáveis.
 * Usado em peer_count_live e match_percent — precisam ser consistentes
 * entre render servidor/cliente.
 */
function deterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function deterministicPeerCount(seed: string): number {
  // Retorna 2-9 casais olhando agora
  return (deterministicHash(seed) % 8) + 2;
}

function deterministicMatchPercent(seed: string): number {
  // Retorna 84-98% de match — sempre alto porque o sort já priorizou
  return 84 + (deterministicHash(seed) % 15);
}

function deterministicSocialProofCount(seed: string): number {
  // 12-48 casais no último trimestre
  return 12 + (deterministicHash(seed) % 37);
}

/**
 * Rule engine de gatilhos mentais (briefing §6).
 *
 * Recebe o estado relevante do casal + o pathname atual e retorna a lista
 * de gatilhos que devem ser renderizados, em ordem de prioridade, com o
 * conteúdo já interpolado (sem placeholders).
 *
 * É uma função PURA — fácil de testar, fácil de chamar de seletor Zustand
 * sem causar re-render storms.
 */

export type TriggerEvalContext = {
  // Estado relevante do casal
  partner_1_name: string | null;
  partner_2_name: string | null;
  city: string | null;
  state: string | null;
  wedding_date: string | null;
  estimated_budget: number | null;
  guest_count: number | null;
  wedding_profile_slug: ProfileSlug | null;
  dream_text: string | null;
  selections: Selection[];
  skipped_categories: CategorySlug[];
  dismissed_triggers: string[];
  fired_once_triggers: string[];
  journey_started_at: string | null;

  // Contexto da página atual
  pathname: string;
};

export type EvaluatedTrigger = {
  rule: TriggerRule;
  // Conteúdo com placeholders já interpolados
  content: {
    icon?: string;
    title: string;
    body: string;
    cta_text?: string;
    cta_href?: string;
  };
};

// ============================================================
// Avaliador de condições individuais
// ============================================================

function checkCondition(
  cond: TriggerCondition,
  ctx: TriggerEvalContext,
): boolean {
  switch (cond.type) {
    case "categories_selected_gte":
      return ctx.selections.length >= cond.value;
    case "categories_selected_lte":
      return ctx.selections.length <= cond.value;
    case "total_confirmed_gte":
      return getTotalConfirmed(ctx.selections) >= cond.value;
    case "total_confirmed_between": {
      if (!ctx.estimated_budget || ctx.estimated_budget <= 0) return false;
      const total = getTotalConfirmed(ctx.selections);
      const min = ctx.estimated_budget * cond.min_pct;
      const max = ctx.estimated_budget * cond.max_pct;
      return total >= min && total <= max;
    }
    case "profile_is":
      return ctx.wedding_profile_slug === cond.value;
    case "days_since_onboarding_gte": {
      if (!ctx.journey_started_at) return false;
      const start = new Date(ctx.journey_started_at).getTime();
      const days = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
      return days >= cond.value;
    }
    case "category_selected":
      return ctx.selections.some((s) => s.category_slug === cond.slug);
    case "category_not_selected":
      return !ctx.selections.some((s) => s.category_slug === cond.slug);
    case "wedding_date_set":
      return ctx.wedding_date != null && ctx.wedding_date.length > 0;
    case "guest_count_set":
      return ctx.guest_count != null && ctx.guest_count > 0;
    case "on_route":
      return ctx.pathname.startsWith(cond.pattern);
    case "on_route_exact":
      return ctx.pathname === cond.path;
    default:
      return false;
  }
}

// ============================================================
// Interpolação de placeholders no copy
// ============================================================

function interpolate(template: string, ctx: TriggerEvalContext): string {
  const profile = profiles.find((p) => p.slug === ctx.wedding_profile_slug);
  const path = getCategoriesOfPath(ctx.wedding_profile_slug);
  const firstCategorySlug = path[0];
  const firstCategory = categories.find((c) => c.slug === firstCategorySlug);
  const pendingCategories = getCategoriesPending(
    ctx.selections,
    ctx.wedding_profile_slug,
    ctx.skipped_categories,
  );
  const nextPending = pendingCategories[0];
  const nextPendingCategory = categories.find((c) => c.slug === nextPending);

  // Tenta extrair categoria atual do pathname (/planejamento/[categoria])
  const routeMatch = ctx.pathname.match(/^\/planejamento\/([^/]+)/);
  const currentCategory = routeMatch?.[1] as CategorySlug | undefined;

  // Vendor destaque: usa o mesmo sort da página de categoria
  // incluindo dreamText e city para que o destaque reflita o que o casal disse
  let vendorDestaque = "um dos profissionais selecionados";
  if (currentCategory) {
    const providers = getProvidersByCategory(currentCategory);
    const sorted = sortVendorsForProfile(
      providers,
      ctx.wedding_profile_slug,
      currentCategory,
      ctx.dream_text,
      ctx.city,
    );
    if (sorted.length >= 1) {
      vendorDestaque = sorted[0].name;
    }
  }

  const totalConfirmed = getTotalConfirmed(ctx.selections);
  const remaining = ctx.estimated_budget
    ? Math.max(0, ctx.estimated_budget - totalConfirmed)
    : 0;

  // Contexto do pathname pra seeds determinísticos (oferta específica)
  const offerMatch = ctx.pathname.match(/^\/oferta\/([^/]+)/);
  const offerSlug = offerMatch?.[1] ?? "";
  const peerSeed = `${offerSlug}-${new Date().toDateString()}`; // muda por dia
  const matchSeed = `${ctx.wedding_profile_slug}-${offerSlug}`;
  const socialSeed = `${ctx.wedding_profile_slug}-${ctx.city}-${currentCategory ?? ""}`;

  // Detecta se a oferta atual é um espaço (categoria local) ou profissional.
  // Usado pra resolver placeholders {Este_tipo} / {deste_tipo} dinamicamente,
  // evitando que o copy chame um venue de "profissional" e vice-versa.
  let isVenue = false;
  if (offerSlug) {
    const offerVendor = getVendorOrVenueBySlug(offerSlug);
    isVenue = offerVendor?.category === "local";
  }
  const ESTE_TIPO = isVenue ? "Este espaço" : "Este profissional";
  const este_tipo = isVenue ? "este espaço" : "este profissional";
  const DESTE_TIPO = isVenue ? "Deste espaço" : "Deste profissional";
  const deste_tipo = isVenue ? "deste espaço" : "deste profissional";

  const replacements: Record<string, string> = {
    "{nome_1}": ctx.partner_1_name ?? "",
    "{nome_2}": ctx.partner_2_name ?? "",
    "{cidade}": ctx.city ?? "sua cidade",
    "{primeira_categoria}": firstCategory?.name.toLowerCase() ?? "local",
    "{profile_name}": profile?.name ?? "",
    "{vendor_destaque}": vendorDestaque,
    "{total_confirmado}": formatBRL(totalConfirmed).replace("R$\u00A0", ""),
    "{diferenca}": formatBRL(remaining).replace("R$\u00A0", ""),
    "{orcamento}": ctx.estimated_budget
      ? formatBRL(ctx.estimated_budget).replace("R$\u00A0", "")
      : "",
    "{proxima_categoria_pendente}":
      nextPendingCategory?.name.toLowerCase() ?? "uma das categorias",
    "{data_extensa}": formatDateExtended(ctx.wedding_date),
    "{guest_count}": ctx.guest_count?.toString() ?? "",
    "{peer_count_live}": offerSlug
      ? deterministicPeerCount(peerSeed).toString()
      : "3",
    "{match_percent}": offerSlug
      ? deterministicMatchPercent(matchSeed).toString()
      : "90",
    "{social_proof_count}": deterministicSocialProofCount(socialSeed).toString(),
    "{Este_tipo}": ESTE_TIPO,
    "{este_tipo}": este_tipo,
    "{Deste_tipo}": DESTE_TIPO,
    "{deste_tipo}": deste_tipo,
  };

  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.split(key).join(value);
  }
  return result;
}

// ============================================================
// Avaliador principal
// ============================================================

export function evaluateTriggers(
  ctx: TriggerEvalContext,
): readonly EvaluatedTrigger[] {
  const matched: EvaluatedTrigger[] = [];

  for (const rule of allTriggers) {
    // Filtra dispensados
    if (ctx.dismissed_triggers.includes(rule.slug)) continue;

    // Filtra once já disparados
    if (rule.once && ctx.fired_once_triggers.includes(rule.slug)) continue;

    // Todas as condições devem bater (AND)
    const allMatch = rule.conditions.every((cond) => checkCondition(cond, ctx));
    if (!allMatch) continue;

    matched.push({
      rule,
      content: {
        icon: rule.content.icon,
        title: interpolate(rule.content.title, ctx),
        body: interpolate(rule.content.body, ctx),
        cta_text: rule.content.cta_text,
        cta_href: rule.content.cta_href,
      },
    });
  }

  // Ordena por prioridade decrescente
  matched.sort((a, b) => b.rule.priority - a.rule.priority);
  return matched;
}
