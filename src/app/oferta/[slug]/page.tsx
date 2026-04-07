import { notFound } from "next/navigation";
import { OfertaClient } from "./oferta-client";
import { venues } from "@/data/venues";
import { vendors } from "@/data/vendors";

/**
 * /oferta/[slug] — Página de perfil de profissional/venue (briefing §5.6).
 *
 * Server Component que valida o slug e busca os dados.
 */
export default async function OfertaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const provider =
    venues.find((v) => v.slug === slug) ??
    vendors.find((v) => v.slug === slug);
  if (!provider) notFound();

  return <OfertaClient slug={slug} />;
}

export function generateStaticParams() {
  return [...venues, ...vendors].map((v) => ({ slug: v.slug }));
}
