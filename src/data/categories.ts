import type { Category } from "@/types";

/**
 * As 14 categorias da jornada do casal (briefing §5.4).
 *
 * O ícone é o nome do componente Lucide — usado em runtime via lookup,
 * pra evitar import dinâmico de todos os ícones.
 */
export const categories: readonly Category[] = [
  {
    slug: "local",
    name: "Local",
    short_description: "Onde o sim acontece",
    icon_name: "MapPin",
  },
  {
    slug: "fotografia",
    name: "Fotografia",
    short_description: "O olhar que vai eternizar o dia",
    icon_name: "Camera",
  },
  {
    slug: "buffet",
    name: "Buffet",
    short_description: "A mesa que vai contar a história",
    icon_name: "Utensils",
  },
  {
    slug: "decoracao",
    name: "Decoração",
    short_description: "A atmosfera de cada cantinho",
    icon_name: "Sparkles",
  },
  {
    slug: "flores",
    name: "Flores",
    short_description: "O perfume e a delicadeza do dia",
    icon_name: "Flower2",
  },
  {
    slug: "roupas-noiva",
    name: "Roupas de Noiva",
    short_description: "O vestido que vocês vão lembrar para sempre",
    icon_name: "Shirt",
  },
  {
    slug: "festa-musica",
    name: "Festa & Música",
    short_description: "A pista que vai durar até o amanhecer",
    icon_name: "Music",
  },
  {
    slug: "convites",
    name: "Convites",
    short_description: "O primeiro toque do casamento",
    icon_name: "Mail",
  },
  {
    slug: "filmagem",
    name: "Filmagem",
    short_description: "O filme que vocês vão assistir mil vezes",
    icon_name: "Film",
  },
  {
    slug: "doces",
    name: "Doces & Bolo",
    short_description: "A doçura que completa a celebração",
    icon_name: "Cake",
  },
  {
    slug: "roupa-noivo",
    name: "Roupa do Noivo",
    short_description: "O traje que marca o grande dia",
    icon_name: "Shirt",
  },
  {
    slug: "mobiliario",
    name: "Mobiliário",
    short_description: "O cenário que acolhe cada momento",
    icon_name: "Armchair",
  },
  {
    slug: "beleza",
    name: "Beleza",
    short_description: "O brilho que vai acompanhar vocês o dia todo",
    icon_name: "Sparkles",
  },
  {
    slug: "bar",
    name: "Bar & Drinks",
    short_description: "O brinde que abre a festa",
    icon_name: "Wine",
  },
] as const;

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
