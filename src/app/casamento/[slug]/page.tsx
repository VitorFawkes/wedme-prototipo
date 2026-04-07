import { CasamentoClient } from "./casamento-client";

/**
 * /casamento/[slug] — Site editorial gerado a partir dos dados do casal.
 *
 * Todos os dados vêm do Zustand client-side. Server Component só passa
 * o slug pra Client. O slug é validado lá (se não houver dados, mostra
 * placeholder).
 */
export default async function CasamentoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CasamentoClient slug={slug} />;
}
