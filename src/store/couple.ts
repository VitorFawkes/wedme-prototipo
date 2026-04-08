import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  CategorySlug,
  ChatTurn,
  CollectedData,
  JourneyStatus,
  ProfileSlug,
  Selection,
} from "@/types";

type CoupleState = {
  // ============================================================
  // Dados do onboarding (briefing §11)
  // ============================================================
  phone: string | null;
  partner_1_name: string | null;
  partner_2_name: string | null;
  wedding_date: string | null;
  city: string | null;
  state: string | null;
  estimated_budget: number | null;
  guest_count: number | null;

  // Campos ricos opcionais (alimentam o site do casamento)
  dance_song: string | null;
  how_they_met: string | null;
  extra_notes: string | null;

  // Histórico da conversa de onboarding (para retomar sessão)
  onboarding_history: ChatTurn[];
  onboarding_complete: boolean;

  // Sonho e perfil
  dream_text: string | null;
  wedding_profile_slug: ProfileSlug | null;
  detected_intents: string[];
  profile_confidence: number | null;

  // Seleções
  selections: Selection[];
  skipped_categories: CategorySlug[];

  // Paleta de cores e cenário
  wedding_color_palette: string | null;
  wedding_scenario: string | null;

  // Estado da jornada
  journey_status: JourneyStatus;
  journey_started_at: string | null;
  created_at: string | null;

  // Gatilhos
  dismissed_triggers: string[];
  fired_once_triggers: string[];

  // ============================================================
  // Ações
  // ============================================================
  applyOnboardingUpdates: (updates: Partial<CollectedData>) => void;
  updateRichData: (updates: {
    dance_song?: string | null;
    how_they_met?: string | null;
    extra_notes?: string | null;
  }) => void;
  appendChatTurn: (turn: ChatTurn) => void;
  markOnboardingComplete: () => void;
  setProfile: (
    slug: ProfileSlug,
    intents: string[],
    dreamText: string,
    confidence: number,
  ) => void;
  addSelection: (s: Selection) => void;
  removeSelection: (categorySlug: CategorySlug) => void;
  skipCategory: (slug: CategorySlug) => void;
  unskipCategory: (slug: CategorySlug) => void;
  setColorPalette: (paletteId: string | null) => void;
  setScenario: (scenario: string | null) => void;
  dismissTrigger: (slug: string) => void;
  markTriggerFired: (slug: string) => void;
  setStatus: (s: JourneyStatus) => void;
  reset: () => void;
};

const initialState = {
  phone: null,
  partner_1_name: null,
  partner_2_name: null,
  wedding_date: null,
  city: null,
  state: null,
  estimated_budget: null,
  guest_count: null,
  dance_song: null,
  how_they_met: null,
  extra_notes: null,
  onboarding_history: [],
  onboarding_complete: false,
  dream_text: null,
  wedding_profile_slug: null,
  detected_intents: [],
  profile_confidence: null,
  selections: [],
  skipped_categories: [],
  wedding_color_palette: null,
  wedding_scenario: null,
  journey_status: "onboarding" as JourneyStatus,
  journey_started_at: null,
  created_at: null,
  dismissed_triggers: [],
  fired_once_triggers: [],
};

export const useCouple = create<CoupleState>()(
  persist(
    (set) => ({
      ...initialState,

      applyOnboardingUpdates: (updates) =>
        set((state) => ({
          ...state,
          ...updates,
          // grava timestamp da primeira atualização
          created_at: state.created_at ?? new Date().toISOString(),
          journey_started_at:
            state.journey_started_at ?? new Date().toISOString(),
        })),

      updateRichData: (updates) =>
        set((state) => ({
          ...state,
          dance_song:
            updates.dance_song !== undefined
              ? updates.dance_song
              : state.dance_song,
          how_they_met:
            updates.how_they_met !== undefined
              ? updates.how_they_met
              : state.how_they_met,
          extra_notes:
            updates.extra_notes !== undefined
              ? updates.extra_notes
              : state.extra_notes,
        })),

      appendChatTurn: (turn) =>
        set((state) => ({
          onboarding_history: [...state.onboarding_history, turn],
        })),

      markOnboardingComplete: () =>
        set({ onboarding_complete: true, journey_status: "exploring" }),

      setProfile: (slug, intents, dreamText, confidence) =>
        set({
          wedding_profile_slug: slug,
          detected_intents: intents,
          dream_text: dreamText,
          profile_confidence: confidence,
        }),

      addSelection: (s) =>
        set((state) => ({
          selections: [
            ...state.selections.filter(
              (sel) => sel.category_slug !== s.category_slug,
            ),
            s,
          ],
          skipped_categories: state.skipped_categories.filter(
            (c) => c !== s.category_slug,
          ),
        })),

      removeSelection: (categorySlug) =>
        set((state) => ({
          selections: state.selections.filter(
            (s) => s.category_slug !== categorySlug,
          ),
        })),

      skipCategory: (slug) =>
        set((state) => ({
          skipped_categories: state.skipped_categories.includes(slug)
            ? state.skipped_categories
            : [...state.skipped_categories, slug],
          selections: state.selections.filter((s) => s.category_slug !== slug),
        })),

      unskipCategory: (slug) =>
        set((state) => ({
          skipped_categories: state.skipped_categories.filter(
            (c) => c !== slug,
          ),
        })),

      setColorPalette: (paletteId) => set({ wedding_color_palette: paletteId }),

      setScenario: (scenario) => set({ wedding_scenario: scenario }),

      dismissTrigger: (slug) =>
        set((state) => ({
          dismissed_triggers: state.dismissed_triggers.includes(slug)
            ? state.dismissed_triggers
            : [...state.dismissed_triggers, slug],
        })),

      markTriggerFired: (slug) =>
        set((state) => ({
          fired_once_triggers: state.fired_once_triggers.includes(slug)
            ? state.fired_once_triggers
            : [...state.fired_once_triggers, slug],
        })),

      setStatus: (s) => set({ journey_status: s }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: "wewedme-couple",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // CRÍTICO: skip hidratação automática. CoupleProvider faz manualmente
      // após mount no client, evitando hydration mismatch SSR/CSR.
      skipHydration: true,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version === 0 && state.wedding_profile_slug === "natureza-destination") {
          state.wedding_profile_slug = "natureza-ar-livre";
        }
        return state as CoupleState;
      },
    },
  ),
);
