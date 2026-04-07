/**
 * Formatadores de dados — moeda BRL, datas em pt-BR.
 */

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const BRL_COMPACT = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatBRL(value: number): string {
  return BRL.format(value);
}

export function formatBRLCompact(value: number): string {
  return BRL_COMPACT.format(value);
}

const MESES_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/**
 * Formata uma data no formato YYYY-MM-DD ou YYYY-MM em texto extenso pt-BR.
 *
 * "2027-03-15" → "15 de março de 2027"
 * "2027-03"    → "março de 2027"
 */
export function formatDateExtended(isoDate: string | null | undefined): string {
  if (!isoDate) return "data a definir";
  const parts = isoDate.split("-");
  if (parts.length === 2) {
    const monthIdx = parseInt(parts[1], 10) - 1;
    return `${MESES_PT[monthIdx]} de ${parts[0]}`;
  }
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    return `${day} de ${MESES_PT[monthIdx]} de ${parts[0]}`;
  }
  return isoDate;
}

/**
 * Versão curta para badges/chips: "15/03/2027" ou "março/2027"
 */
export function formatDateShort(isoDate: string | null | undefined): string {
  if (!isoDate) return "-";
  const parts = isoDate.split("-");
  if (parts.length === 2) {
    return `${MESES_PT[parseInt(parts[1], 10) - 1]}/${parts[0]}`;
  }
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
}
