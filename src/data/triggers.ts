import type { TriggerRule } from "@/types";

/**
 * Rule engine de gatilhos mentais v2 — baseado em benchmark de
 * conversão de alto valor (Aman, Net-a-Porter, Zola, Joy) + Cialdini.
 *
 * Princípios:
 * - Reciprocidade (presente, consulta gratuita)
 * - Prova social HIPER-específica (perfil + cidade + timestamp)
 * - Escassez CONCRETA (nunca manipulativa)
 * - Peer influence (outros casais parecidos)
 * - Loss aversion (já travaram X — 48h pra finalizar)
 * - Authority (curadoria verificada)
 * - Tangibility (preview do site, mood board)
 *
 * Os placeholders são interpolados em runtime por `evaluate-triggers.ts`.
 */

export const triggers: readonly TriggerRule[] = [
  // ============================================================
  // 1. BOAS-VINDAS AO CAMINHO — reciprocidade + personalização
  // ============================================================
  {
    slug: "boas-vindas-caminho",
    name: "Boas-vindas ao caminho personalizado",
    priority: 100,
    once: false,
    position: "inline_card",
    style: "prominent",
    conditions: [
      { type: "categories_selected_lte", value: 0 },
      { type: "on_route_exact", path: "/planejamento" },
    ],
    content: {
      icon: "Sparkles",
      title: "Bem-vindos, {nome_1} e {nome_2}",
      body: "Montamos este caminho olhando para o sonho de vocês. Começamos por {primeira_categoria}, que costuma fazer mais diferença. Podem seguir a ordem ou ir pela categoria que mais animar.",
    },
  },

  // ============================================================
  // 2. PRIMEIRA ESCOLHA CONFIRMADA — efeito de progresso
  // ============================================================
  {
    slug: "primeira-escolha",
    name: "Primeira escolha confirmada",
    priority: 90,
    once: true,
    position: "inline_card",
    style: "subtle",
    conditions: [{ type: "categories_selected_gte", value: 1 }],
    content: {
      icon: "Sparkles",
      title: "Primeira escolha feita 🤍",
      body: "A partir de agora, cada categoria confirmada trava o preço e aciona nosso time por trás. Vocês escolhem, a gente resolve.",
    },
  },

  // ============================================================
  // 3. PROVA SOCIAL NA CATEGORIA — peer influence (leve)
  // ============================================================
  {
    slug: "prova-social-categoria",
    name: "Casais com perfil parecido",
    priority: 78,
    once: false,
    position: "inline_card",
    style: "subtle",
    conditions: [{ type: "on_route", pattern: "/planejamento/" }],
    content: {
      icon: "Users",
      title: "Destaque nesta categoria",
      body: "{vendor_destaque} é uma das opções mais escolhidas por casais com um estilo parecido com o de vocês.",
    },
  },

  // ============================================================
  // 4. ESCASSEZ CONCRETA DA DATA — urgência sem manipulação
  // ============================================================
  {
    slug: "escassez-data",
    name: "Escassez concreta da data do casal",
    priority: 85,
    once: false,
    position: "floating_badge",
    style: "subtle",
    conditions: [
      { type: "wedding_date_set" },
      { type: "on_route", pattern: "/oferta/" },
    ],
    content: {
      icon: "Clock",
      title: "Data disponível",
      body: "{Este_tipo} tem o dia de vocês livre ({data_extensa}).",
    },
  },

  // ============================================================
  // 5. PEER LIVE — quem mais está olhando AGORA (novo)
  // ============================================================
  {
    slug: "peer-live-oferta",
    name: "Outros casais observando esta op\u00e7\u00e3o agora",
    priority: 70,
    once: false,
    position: "floating_badge",
    style: "subtle",
    conditions: [{ type: "on_route", pattern: "/oferta/" }],
    content: {
      icon: "Eye",
      title: "Bastante procurado",
      body: "{Este_tipo} está entre os mais visitados da plataforma.",
    },
  },

  // ============================================================
  // 6. MATCH DE PERFIL — autoridade + match percentual (novo)
  // ============================================================
  {
    slug: "match-perfil",
    name: "Compatibilidade percentual com o perfil",
    priority: 65,
    once: false,
    position: "inline_card",
    style: "subtle",
    conditions: [{ type: "on_route", pattern: "/oferta/" }],
    content: {
      icon: "Target",
      title: "{match_percent}% de match com o perfil de vocês",
      body: "Cruzamos o que vocês contaram com o portfólio e estilo {deste_tipo}. Uma combinação que faz sentido pra vocês.",
    },
  },

  // ============================================================
  // 7. BRINDE POR 3 CONFIRMAÇÕES — reciprocidade tangível
  // ============================================================
  {
    slug: "presente-tres-confirmacoes",
    name: "Presente após 3 confirmações",
    priority: 95,
    once: true,
    position: "modal",
    style: "prominent",
    conditions: [{ type: "categories_selected_gte", value: 3 }],
    content: {
      icon: "Gift",
      title: "Um presente nosso pra vocês",
      body: "Vocês confirmaram 3 categorias. Como reconhecimento, estamos oferecendo um ensaio pré-wedding completo com um dos nossos fotógrafos parceiros, por nossa conta. É nosso jeito de dizer obrigado.",
      cta_text: "Aceitar presente",
    },
  },

  // ============================================================
  // 8. LOSS AVERSION — reserva de 48h (o gatilho mais importante)
  // ============================================================
  {
    slug: "loss-aversion-checkout",
    name: "Valores garantidos",
    priority: 88,
    once: false,
    position: "inline_card",
    style: "subtle",
    conditions: [
      { type: "categories_selected_gte", value: 3 },
      { type: "total_confirmed_gte", value: 20000 },
      { type: "on_route_exact", path: "/meu-casamento" },
    ],
    content: {
      icon: "ShieldCheck",
      title: "Vocês travaram R$ {total_confirmado}",
      body: "Os valores estão garantidos por enquanto. Quando quiserem, podemos finalizar.",
      cta_text: "Ir ao checkout",
      cta_href: "/checkout",
    },
  },

  // ============================================================
  // 9. QUASE LÁ — proximidade do orçamento total
  // ============================================================
  {
    slug: "quase-la",
    name: "Quase lá, faltam R$X pra completar o orçamento",
    priority: 72,
    once: false,
    position: "inline_card",
    style: "normal",
    conditions: [
      { type: "total_confirmed_between", min_pct: 0.7, max_pct: 0.95 },
      { type: "on_route_exact", path: "/meu-casamento" },
    ],
    content: {
      icon: "Target",
      title: "Vocês estão a R$ {diferenca} de completar o orçamento",
      body: "A única categoria ainda aberta que muda o caráter do casamento é {proxima_categoria_pendente}. É aí que a atmosfera de vocês ganha a forma final.",
    },
  },

  // ============================================================
  // 10. CONVIDADOS — gatilho de compatibilidade de tamanho (novo)
  // ============================================================
  {
    slug: "guest-count-venue-fit",
    name: "Compatibilidade de convidados com espaços",
    priority: 60,
    once: true,
    position: "inline_card",
    style: "subtle",
    conditions: [
      { type: "on_route_exact", path: "/planejamento/local" },
      { type: "guest_count_set" },
    ],
    content: {
      icon: "Users",
      title: "Filtrado para {guest_count} convidados",
      body: "Já priorizamos espaços com capacidade adequada. Os locais abaixo acomodam confortavelmente o tamanho do casamento de vocês, sem pista vazia, sem aperto.",
    },
  },
] as const;
