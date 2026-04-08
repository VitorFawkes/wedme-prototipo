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
  | "natureza-ar-livre"
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
  | "filmagem"
  | "doces"
  | "roupa-noivo"
  | "mobiliario"
  | "beleza"
  | "bar";

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
  services?: ServiceGroup[];
  bring_your_own?: BringYourOwnOption[];
  faq?: CategoryFAQ[];
  color_palettes?: ColorPalette[];
};

// ============================================================
// Serviços individuais (seleção item-a-item)
// ============================================================

export type ServiceItem = {
  id: string;
  name: string;
  price: number;
  category: "base" | "addon" | "infrastructure";
  description?: string;
};

export type ServiceGroup = {
  id: string;
  name: string;
  items: ServiceItem[];
  default_items: string[];
  description?: string;
};

export type BringYourOwnOption = {
  id: string;
  label: string;
  infrastructure_items: ServiceItem[];
};

export type ColorPalette = {
  id: string;
  name: string;
  colors: string[];
};

export type CategoryFAQ = {
  question: string;
  answer: string;
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
  selected_item_ids?: string[];
  is_bring_your_own?: boolean;
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
  | { type: "guest_count_set" }
  | { type: "on_route"; pattern: string }
  | { type: "on_route_exact"; path: string };

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
  phone?: string;
  partner_1_name?: string;
  partner_2_name?: string;
  wedding_date?: string;
  city?: string;
  state?: string;
  estimated_budget?: number;
  guest_count?: number;
};

/**
 * Campos "ricos" opcionais — coletados ao longo da jornada (não no onboarding básico).
 * Alimentam o site do casamento e gatilhos mais espec\u00edficos.
 */
export type CoupleRichData = {
  dance_song?: string; // "A primeira m\u00fasica — vai ser de voc\u00eas?"
  how_they_met?: string; // hist\u00f3ria do casal (opcional)
  extra_notes?: string; // pedidos especiais ao time we.wedme
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
    | "phone"
    | "partner_names"
    | "wedding_date"
    | "city"
    | "estimated_budget"
    | "guest_count"
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
