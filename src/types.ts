/**
 * Types compartilhados do protótipo we.wedme.
 *
 * Esses tipos são a fonte da verdade para dados estáticos (perfis, venues,
 * vendors, gatilhos), estado do casal (Zustand) e contratos das APIs.
 */

// ============================================================
// Perfis de casamento (5 perfis fixos — briefing §7)
// ============================================================

export type ProfileSlug =
  | "classico-atemporal"
  | "intimo-emocional"
  | "minimalista-moderno"
  | "natureza-destination"
  | "grande-celebracao";

export type Profile = {
  slug: ProfileSlug;
  name: string;
  description: string;
  detection_keywords: string[];
  default_path_categories: CategorySlug[];
  accent_color: string;
  example_venues: string[];
};

// ============================================================
// Categorias da jornada (briefing §5.4)
// ============================================================

export type CategorySlug =
  | "local"
  | "fotografia"
  | "buffet"
  | "decoracao"
  | "flores"
  | "roupas-noiva"
  | "festa-musica"
  | "convites"
  | "filmagem";

export type Category = {
  slug: CategorySlug;
  name: string;
  short_description: string;
  icon_name: string; // nome do ícone Lucide (ex: "MapPin")
};

// ============================================================
// Profissionais e venues
// ============================================================

export type Package = {
  id: string;
  name: string;
  price: number;
  includes: string[];
  excludes: string[];
};

export type Review = {
  couple_name: string;
  initials: string;
  city: string;
  date: string;
  rating: number;
  quote: string;
  photo?: string;
};

export type Vendor = {
  slug: string;
  name: string;
  category: CategorySlug;
  tagline: string;
  city: string;
  state: string;
  neighborhood?: string;
  bio: string;
  cover: string;
  portfolio: string[];
  verified: boolean;
  rating: number;
  total_reviews: number;
  social_proof_line: string;
  packages: Package[];
  reviews: Review[];
  unavailable_dates: string[];
  highlights?: string[];
  tier?: number;
};

// ============================================================
// Estado do casal (Zustand store — briefing §11)
// ============================================================

export type Selection = {
  category_slug: CategorySlug;
  vendor_slug: string;
  package_id: string;
  quoted_price: number;
  selected_at: string; // ISO
};

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type JourneyStatus =
  | "onboarding"
  | "exploring"
  | "selecting"
  | "checkout"
  | "complete";

// ============================================================
// Gatilhos mentais (briefing §6)
// ============================================================

export type TriggerCondition =
  | { type: "categories_selected_gte"; value: number }
  | { type: "categories_selected_lte"; value: number }
  | { type: "total_confirmed_gte"; value: number }
  | { type: "total_confirmed_between"; min_pct: number; max_pct: number }
  | { type: "profile_is"; value: ProfileSlug }
  | { type: "days_since_onboarding_gte"; value: number }
  | { type: "category_selected"; slug: CategorySlug }
  | { type: "category_not_selected"; slug: CategorySlug }
  | { type: "wedding_date_set" }
  | { type: "on_route"; pattern: string };

export type TriggerPosition =
  | "top_bar"
  | "inline_card"
  | "floating_badge"
  | "modal";

export type TriggerStyle = "subtle" | "normal" | "prominent";

export type TriggerRule = {
  slug: string;
  name: string;
  priority: number;
  conditions: TriggerCondition[];
  once: boolean;
  position: TriggerPosition;
  style: TriggerStyle;
  content: {
    icon?: string;
    title: string;
    body: string;
    cta_text?: string;
    cta_href?: string;
  };
};

// ============================================================
// Contratos das APIs (briefing §13)
// ============================================================

export type CollectedData = {
  partner_1_name?: string;
  partner_2_name?: string;
  wedding_date?: string;
  city?: string;
  state?: string;
  estimated_budget?: number;
  email?: string;
};

export type OnboardingStepRequest = {
  collected_so_far: CollectedData;
  conversation_history: { role: "user" | "assistant"; content: string }[];
  user_message: string;
};

export type OnboardingStepResponse = {
  updates: CollectedData;
  assistant_reply: string;
  next_field_to_ask:
    | "partner_names"
    | "wedding_date"
    | "city"
    | "estimated_budget"
    | "email"
    | null;
  next_question: string;
  needs_clarification: boolean;
};

export type ClassifyDreamRequest = {
  dream_text: string;
  partner_names?: string;
  city?: string;
  wedding_date?: string;
};

export type ClassifyDreamResponse = {
  profile_slug: ProfileSlug;
  confidence: number;
  detected_intents: string[];
  reasoning: string;
};
