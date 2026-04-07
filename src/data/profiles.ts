import type { Profile } from "@/types";

/**
 * Os 5 perfis de casamento (briefing §7).
 *
 * Cada texto descritivo, keyword e ordem de path é parte do produto —
 * não inventar, não modificar sem consultar o briefing.
 */
export const profiles: readonly Profile[] = [
  {
    slug: "classico-atemporal",
    name: "Clássico Atemporal",
    description:
      "Vocês sonham com tradições, elegância e detalhes que atravessam gerações. Um casamento refinado, com cerimônia formal e celebração que respira sofisticação.",
    detection_keywords: [
      "tradição",
      "tradicional",
      "clássico",
      "elegante",
      "elegância",
      "família",
      "igreja",
      "formal",
      "cerimônia",
      "refinado",
      "sofisticado",
    ],
    default_path_categories: [
      "local",
      "fotografia",
      "buffet",
      "decoracao",
      "flores",
      "roupas-noiva",
      "festa-musica",
      "convites",
    ],
    accent_color: "#7F0E4A",
    example_venues: ["welucci-fagundes", "welucci-the-one", "patio-welucci"],
  },
  {
    slug: "intimo-emocional",
    name: "Íntimo & Emocional",
    description:
      "Um casamento pequeno, onde cada convidado importa e cada detalhe conta uma história. A emoção acima de tudo, e a certeza de que menos pode ser muito mais.",
    detection_keywords: [
      "íntimo",
      "intimista",
      "pequeno",
      "emoção",
      "emocionante",
      "aconchegante",
      "simples",
      "mini wedding",
      "poucos convidados",
      "perto",
      "amor",
    ],
    default_path_categories: [
      "local",
      "fotografia",
      "decoracao",
      "flores",
      "buffet",
      "roupas-noiva",
    ],
    accent_color: "#C45F9B",
    example_venues: ["welucci-single", "casa-welucci", "welucci-sansu"],
  },
  {
    slug: "minimalista-moderno",
    name: "Minimalista Moderno",
    description:
      "Design contemporâneo, paleta sóbria e uma celebração sem excessos. Só o que importa, feito com excelência, arquitetura, luz e atmosfera no lugar do exagero.",
    detection_keywords: [
      "minimalista",
      "moderno",
      "clean",
      "design",
      "sóbrio",
      "contemporâneo",
      "arquitetura",
      "preto e branco",
      "geométrico",
      "urbano",
    ],
    default_path_categories: [
      "local",
      "fotografia",
      "decoracao",
      "buffet",
      "festa-musica",
      "roupas-noiva",
    ],
    accent_color: "#0C0106",
    example_venues: ["welucci-the-one", "welucci-village", "welucci-single"],
  },
  {
    slug: "natureza-destination",
    name: "Natureza & Destination",
    description:
      "Ao ar livre, cercados de verde, pé na areia ou debaixo de uma figueira centenária. Um casamento que respira liberdade e conexão com o lugar.",
    detection_keywords: [
      "natureza",
      "ar livre",
      "verde",
      "praia",
      "campo",
      "destination",
      "sol",
      "pôr do sol",
      "vista",
      "ao ar livre",
      "outdoor",
      "jardim",
      "sítio",
    ],
    default_path_categories: [
      "local",
      "fotografia",
      "decoracao",
      "flores",
      "buffet",
      "festa-musica",
    ],
    accent_color: "#5C7F4A",
    example_venues: [
      "welucci-vila-real",
      "welucci-ocean",
      "welucci-sansu",
      "welucci-fontana",
    ],
  },
  {
    slug: "grande-celebracao",
    name: "Grande Celebração",
    description:
      "Muitos convidados, festa até o sol nascer, pista cheia e comemoração sem medida. A alegria coletiva como protagonista, o tipo de casamento que vira história.",
    detection_keywords: [
      "festa",
      "grande",
      "muitos convidados",
      "dança",
      "música",
      "animado",
      "até o amanhecer",
      "celebração",
      "comemorar",
      "balada",
      "pista",
    ],
    default_path_categories: [
      "local",
      "festa-musica",
      "buffet",
      "fotografia",
      "decoracao",
      "flores",
      "roupas-noiva",
    ],
    accent_color: "#7F0E4A",
    example_venues: ["welucci-estaiada", "patio-welucci", "welucci-kratos"],
  },
] as const;

export function getProfileBySlug(slug: string): Profile | undefined {
  return profiles.find((p) => p.slug === slug);
}
