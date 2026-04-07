import type {
  CollectedData,
  OnboardingStepResponse,
} from "@/types";

/**
 * Fallback local do `/api/onboarding-step` quando OPENAI_API_KEY não existe
 * (briefing §5.2 — "Fallback sem API key").
 *
 * Estratégia simples por regex/keyword. Não tenta extrair múltiplos campos
 * de uma única mensagem — a inteligência de verdade é só com gpt-5.1.
 *
 * O README deixa claro: o "uau" do onboarding requer API key.
 */

// Lista mínima de cidades brasileiras conhecidas para extrair de texto livre
const KNOWN_CITIES: Record<string, string> = {
  "são paulo": "SP",
  "sao paulo": "SP",
  campinas: "SP",
  santos: "SP",
  guarujá: "SP",
  guaruja: "SP",
  "rio de janeiro": "RJ",
  niterói: "RJ",
  "belo horizonte": "MG",
  brasília: "DF",
  brasilia: "DF",
  curitiba: "PR",
  florianópolis: "SC",
  florianopolis: "SC",
  "porto alegre": "RS",
  recife: "PE",
  salvador: "BA",
  trancoso: "BA",
  ilhabela: "SP",
  "campos do jordão": "SP",
  fortaleza: "CE",
  vitória: "ES",
  goiânia: "GO",
};

const MONTH_KEYWORDS: Record<string, string> = {
  janeiro: "01",
  fevereiro: "02",
  março: "03",
  marco: "03",
  abril: "04",
  maio: "05",
  junho: "06",
  julho: "07",
  agosto: "08",
  setembro: "09",
  outubro: "10",
  novembro: "11",
  dezembro: "12",
};

const CURRENT_YEAR = new Date().getFullYear();

function tryParseNames(text: string): { p1?: string; p2?: string } {
  // Splits comuns: "Ana e Pedro", "Ana & Pedro", "ana, pedro"
  const cleaned = text.trim().replace(/^(somos|sou|me chamo|meu nome é)\s+/i, "");
  const match = cleaned.match(/([\wÀ-ÿ]+)\s*(?:e|&|,)\s*([\wÀ-ÿ]+)/i);
  if (match) {
    return {
      p1: capitalize(match[1]),
      p2: capitalize(match[2]),
    };
  }
  return {};
}

function tryParseDate(text: string): string | undefined {
  // DD/MM/YYYY ou DD-MM-YYYY
  const dmy = text.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  // "março de 2027" → 2027-03
  const monthMatch = text.toLowerCase().match(
    /(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s*(?:de)?\s*(\d{4})?/,
  );
  if (monthMatch) {
    const month = MONTH_KEYWORDS[monthMatch[1]];
    const year = monthMatch[2] ?? String(CURRENT_YEAR + 1);
    return `${year}-${month}`;
  }
  return undefined;
}

function tryParseBudget(text: string): number | undefined {
  const lower = text.toLowerCase().replace(/\./g, "").replace(/,/g, ".");
  // "80 mil", "80k", "80mil"
  const milMatch = lower.match(/(\d+(?:\.\d+)?)\s*(mil|k|pau)/);
  if (milMatch) {
    return Math.round(parseFloat(milMatch[1]) * 1000);
  }
  // "R$ 80000" ou só "80000"
  const numMatch = lower.match(/r?\$?\s*(\d{4,7})/);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }
  return undefined;
}

function tryParsePhone(text: string): string | undefined {
  // Aceita formatos: (11) 99999-1234, 11 99999-1234, 11999991234, +55 11 99999-1234
  const cleaned = text.replace(/[^\d+\s()-]/g, "").trim();
  const match = cleaned.match(/\+?[\d\s()-]{8,}/);
  if (match) {
    const digits = match[0].replace(/\D/g, "");
    if (digits.length >= 8 && digits.length <= 13) return match[0].trim();
  }
  return undefined;
}

function tryParseGuestCount(text: string): number | undefined {
  const lower = text.toLowerCase();
  // "mini wedding" → 40
  if (/mini\s*wedding/.test(lower)) return 40;
  if (/\b(\u00edntimo|intimo|intimista)\b/.test(lower)) return 70;
  if (/\b(grande|gigante)\b/.test(lower) && /festa|casamento/.test(lower))
    return 200;
  // "uns 80", "80 convidados", "entre 100 e 150"
  const range = lower.match(/entre\s+(\d{2,4})\s*(?:e|a)\s*(\d{2,4})/);
  if (range) {
    return Math.round((parseInt(range[1], 10) + parseInt(range[2], 10)) / 2);
  }
  const direct = lower.match(/(?:uns|aproximadamente|cerca de|uns?)?\s*(\d{2,4})\s*(?:convidados|pessoas|pax)/);
  if (direct) return parseInt(direct[1], 10);
  // "uns 80" sozinho
  const loose = lower.match(/\buns?\s+(\d{2,4})\b/);
  if (loose) return parseInt(loose[1], 10);
  return undefined;
}

function tryParseCity(text: string): { city?: string; state?: string } {
  const lower = text.toLowerCase();

  // 1. Cidade conhecida tem prioridade
  for (const [city, state] of Object.entries(KNOWN_CITIES)) {
    if (lower.includes(city)) {
      return {
        city: city
          .split(" ")
          .map((w) => capitalize(w))
          .join(" "),
        state,
      };
    }
  }

  // 2. Padrões de "região" sem cidade exata. NÃO ficamos perguntando qual
  //    cidade depois — gravamos a região como city e seguimos.
  if (/litoral.*paulista|praia.*sp|praia em sao paulo|praia em s\u00e3o paulo/.test(lower)) {
    return { city: "Litoral de SP", state: "SP" };
  }
  if (/litoral.*carioca|praia.*rj|praia em rio/.test(lower)) {
    return { city: "Litoral do RJ", state: "RJ" };
  }
  if (/litoral.*bahia|praia.*ba|praia.*nordeste/.test(lower)) {
    return { city: "Litoral da Bahia", state: "BA" };
  }
  if (/^\s*(na |em uma |numa )?praia\s*\.?\s*$|qualquer praia/.test(lower)) {
    return { city: "Praia" };
  }
  if (/interior.*sp|interior paulista/.test(lower)) {
    return { city: "Interior de SP", state: "SP" };
  }
  if (/^\s*(no |em |num )?interior\s*\.?\s*$/.test(lower)) {
    return { city: "Interior" };
  }
  if (/^\s*(no |em uma |numa )?(campo|s\u00edtio|sitio|fazenda)/.test(lower)) {
    return { city: "Campo" };
  }

  return {};
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ============================================================
// Pool de respostas da assistente — pré-escritas, plausíveis
// ============================================================

const REPLIES = {
  greeting: "Que bom que vocês toparam. Vamos começar pelo básico.",
  phone_extracted: "Anotado. Agora a gente se fala.",
  ask_phone: "Qual o melhor WhatsApp pra gente se comunicar com vocês?",
  names_extracted: (p1: string, p2: string) =>
    `${p1} e ${p2}, que combinação linda. Anotado.`,
  ask_names: "Como vocês se chamam? (Só o primeiro nome de cada um já basta.)",
  ask_date: "E vocês já têm uma data ou pelo menos uma ideia de mês?",
  date_extracted: "Anotado. Falta pouco.",
  ask_city: "Em qual cidade ou região vai ser o grande dia?",
  city_extracted: (city: string) => `${city}, anotado.`,
  ask_budget: "E o orçamento? Pode ser uma estimativa, qualquer noção serve.",
  budget_extracted: "Anotado. Dá pra trabalhar muito bem com esse valor.",
  ask_guests:
    "E quantos convidados? Pode ser redondo: uns 80, entre 100 e 150, ou 'mini wedding'.",
  guests_extracted: "Anotado. Isso já me ajuda a montar o caminho certo.",
  transition:
    "Perfeito, tudo anotado.",
  clarification: "Pode reformular pra eu entender melhor?",
};

// ============================================================
// Função principal — uma chamada por turno
// ============================================================

export function fakeOnboardingStep(
  collected: CollectedData,
  userMessage: string,
): OnboardingStepResponse {
  const updates: CollectedData = {};
  let reply = "";

  // Tenta extrair o que ainda falta
  if (!collected.phone) {
    const phone = tryParsePhone(userMessage);
    if (phone) {
      updates.phone = phone;
      reply = REPLIES.phone_extracted;
    }
  } else if (!collected.partner_1_name || !collected.partner_2_name) {
    const { p1, p2 } = tryParseNames(userMessage);
    if (p1 && p2) {
      updates.partner_1_name = p1;
      updates.partner_2_name = p2;
      reply = REPLIES.names_extracted(p1, p2);
    }
  } else if (!collected.wedding_date) {
    const date = tryParseDate(userMessage);
    if (date) {
      updates.wedding_date = date;
      reply = REPLIES.date_extracted;
    }
  } else if (!collected.city) {
    const { city, state } = tryParseCity(userMessage);
    if (city) {
      updates.city = city;
      if (state) updates.state = state;
      reply = REPLIES.city_extracted(city);
    }
  } else if (!collected.estimated_budget) {
    const budget = tryParseBudget(userMessage);
    if (budget) {
      updates.estimated_budget = budget;
      reply = REPLIES.budget_extracted;
    }
  } else if (!collected.guest_count) {
    const guests = tryParseGuestCount(userMessage);
    if (guests) {
      updates.guest_count = guests;
      reply = REPLIES.guests_extracted;
    }
  }

  // Estado merged para decidir o próximo passo
  const merged = { ...collected, ...updates };

  // Determina próxima pergunta
  let next_field_to_ask: OnboardingStepResponse["next_field_to_ask"] = null;
  let next_question = "";

  if (!merged.phone) {
    next_field_to_ask = "phone";
    next_question = REPLIES.ask_phone;
  } else if (!merged.partner_1_name || !merged.partner_2_name) {
    next_field_to_ask = "partner_names";
    next_question = REPLIES.ask_names;
  } else if (!merged.wedding_date) {
    next_field_to_ask = "wedding_date";
    next_question = REPLIES.ask_date;
  } else if (!merged.city) {
    next_field_to_ask = "city";
    next_question = REPLIES.ask_city;
  } else if (!merged.estimated_budget) {
    next_field_to_ask = "estimated_budget";
    next_question = REPLIES.ask_budget;
  } else if (!merged.guest_count) {
    next_field_to_ask = "guest_count";
    next_question = REPLIES.ask_guests;
  }

  // Se não conseguimos extrair nada, marca como needs_clarification
  const needs_clarification =
    Object.keys(updates).length === 0 && next_field_to_ask !== null;

  // Reply final
  if (!reply) {
    if (needs_clarification && userMessage.trim().length > 0) {
      reply = REPLIES.clarification;
    } else if (userMessage.toLowerCase().includes("topa")) {
      reply = REPLIES.greeting;
    }
  }

  // Transição final
  if (next_field_to_ask === null) {
    reply = REPLIES.transition;
  }

  return {
    updates,
    assistant_reply: reply,
    next_field_to_ask,
    next_question,
    needs_clarification,
  };
}
