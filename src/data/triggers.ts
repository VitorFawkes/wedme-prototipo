import type { TriggerRule } from "@/types";

/**
 * As 7 regras de gatilhos mentais (briefing §6.2).
 *
 * O copy de cada gatilho é FINAL — não modificar. As variáveis entre {chaves}
 * são interpoladas em runtime pela função de renderização (ver
 * src/lib/evaluate-triggers.ts e os componentes de trigger).
 *
 * Ordem por priority (maior = aparece primeiro). Cada gatilho tem condições
 * que precisam todas bater (AND). once: true grava em fired_once_triggers.
 */

export const triggers: readonly TriggerRule[] = [
  // 1. Boas-vindas ao caminho — reciprocidade + personalização
  {
    slug: "boas-vindas-caminho",
    name: "Boas-vindas ao caminho personalizado",
    priority: 100,
    once: false,
    position: "inline_card",
    style: "prominent",
    conditions: [
      { type: "categories_selected_lte", value: 0 },
      { type: "on_route", pattern: "/planejamento" },
    ],
    content: {
      icon: "Sparkles",
      title:
        "Bem-vindos, {nome_1} e {nome_2}",
      body: "Montamos este caminho olhando para o sonho de vocês — começando por {primeira_categoria}, que é onde tudo costuma fazer mais diferença para casamentos {profile_name}.",
    },
  },

  // 2. Primeira escolha confirmada — efeito de progresso
  {
    slug: "primeira-escolha",
    name: "Primeira escolha confirmada",
    priority: 90,
    once: true,
    position: "top_bar",
    style: "normal",
    conditions: [{ type: "categories_selected_gte", value: 1 }],
    content: {
      icon: "Sparkles",
      title: "Primeira escolha feita",
      body: "Daqui pra frente, a cada categoria confirmada, o casamento de vocês vai tomando forma — e a gente já começa a mover as peças por trás.",
    },
  },

  // 3. Brinde por 3 confirmações — reciprocidade + tangibilidade
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
      body: "Vocês acabam de confirmar 3 categorias. Como reconhecimento, estamos oferecendo um ensaio pré-wedding completo com um dos nossos fotógrafos parceiros — por nossa conta. É nosso jeito de dizer obrigado.",
      cta_text: "Aceitar presente",
    },
  },

  // 4. Prova social específica ao perfil — pertencimento
  {
    slug: "prova-social-categoria",
    name: "Prova social específica ao perfil na categoria",
    priority: 70,
    once: false,
    position: "inline_card",
    style: "subtle",
    conditions: [{ type: "on_route", pattern: "/planejamento/" }],
    content: {
      icon: "Users",
      title: "Casais com perfil parecido",
      body: "Outros casais com perfil {profile_name} que casaram em {cidade} no último trimestre escolheram, em média, {vendor_destaque} para esta categoria. Vocês podem explorar por conta — mas achamos justo vocês saberem.",
    },
  },

  // 5. Escassez concreta de data — urgência sem manipulação
  {
    slug: "escassez-data",
    name: "Escassez concreta da data do casal",
    priority: 80,
    once: false,
    position: "floating_badge",
    style: "subtle",
    conditions: [
      { type: "wedding_date_set" },
      { type: "on_route", pattern: "/oferta/" },
    ],
    content: {
      icon: "Clock",
      title: "{data_extensa}",
      body: "Este profissional tem esta data livre — mas tem outra proposta aberta para o mesmo fim de semana. Normalmente definem em 72 horas.",
    },
  },

  // 6. Loss aversion no checkout abandonado
  {
    slug: "loss-aversion-checkout",
    name: "Loss aversion checkout abandonado",
    priority: 85,
    once: false,
    position: "top_bar",
    style: "normal",
    conditions: [
      { type: "categories_selected_gte", value: 3 },
      { type: "total_confirmed_gte", value: 20000 },
      { type: "on_route", pattern: "/meu-casamento" },
    ],
    content: {
      icon: "ShieldCheck",
      title: "Vocês já travaram R$ {total_confirmado}",
      body: "A reserva fica garantida por 48 horas — depois disso, os preços podem mudar. Podemos finalizar?",
      cta_text: "Ir ao checkout",
      cta_href: "/checkout",
    },
  },

  // 7. Quase lá — meta próxima
  {
    slug: "quase-la",
    name: "Quase lá — faltam R$X para completar o orçamento",
    priority: 75,
    once: false,
    position: "inline_card",
    style: "normal",
    conditions: [
      { type: "total_confirmed_between", min_pct: 0.7, max_pct: 0.95 },
      { type: "on_route", pattern: "/meu-casamento" },
    ],
    content: {
      icon: "Target",
      title: "Vocês estão a R$ {diferenca} de completar o orçamento",
      body: "A única categoria importante ainda aberta é {proxima_categoria_pendente} — e é aí que o casamento de vocês ganha a cara final.",
    },
  },
] as const;
