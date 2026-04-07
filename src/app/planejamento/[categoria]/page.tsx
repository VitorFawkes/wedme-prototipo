import { notFound } from "next/navigation";
import { CategoryClient } from "./category-client";
import { categories } from "@/data/categories";
import type { CategorySlug } from "@/types";

/**
 * /planejamento/[categoria] — Lista de profissionais da categoria.
 *
 * Server Component que valida o slug e delega para Client Component.
 * Next 16: params é Promise.
 */
export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const category = categories.find((c) => c.slug === categoria);
  if (!category) notFound();

  return <CategoryClient categorySlug={categoria as CategorySlug} />;
}

export function generateStaticParams() {
  return categories.map((c) => ({ categoria: c.slug }));
}
