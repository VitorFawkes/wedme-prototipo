# we.wedme — Protótipo navegável

Plataforma brasileira de planejamento de casamentos com curadoria centralizada. Este é um **protótipo navegável** (não um MVP) — front-end puro com dados mockados, projetado para demonstrar a lógica de inteligência da plataforma.

> **Nota:** este repositório é a versão de demonstração / validação. O produto real (com Supabase, autenticação, áreas de admin/vendor/casal) é desenvolvido em [VitorFawkes/we.wedme](https://github.com/VitorFawkes/we.wedme) (privado). Os dois codebases são intencionalmente separados.

## Stack

- **Next.js 16** (App Router) + TypeScript + **Bun**
- **Tailwind CSS v4** + **shadcn/ui** (base-ui) customizado para o DNA editorial
- **Zustand** com `persist` (localStorage) — estado do casal
- **Framer Motion** — animações sutis (transform/opacity only)
- **OpenAI gpt-5.1** + **Whisper** — IA para onboarding conversacional, classificação do sonho e transcrição de áudio
- **Cormorant Garamond** + **Inter** via `next/font/google`

## Mobile-first sem exceção

Cada componente, cada página, cada interação é desenhada **primeiro para mobile**. A premissa é que casais planejam casamento no celular, no metrô, na fila do café — e o site do casamento gerado ao final é compartilhado por WhatsApp (abre quase sempre no mobile).

Princípios inegociáveis:

- **Touch targets ≥ 44×44px** em qualquer elemento clicável
- **`100dvh` / `100svh`** em todos os hero (nunca `vh`, que quebra no iOS Safari)
- **Safe areas** (`safe-top`, `safe-bottom`) em elementos fixed top/bottom
- **`text-base` (16px)** mínimo em inputs (previne auto-zoom iOS)
- **Sem horizontal scroll. Nunca.**
- **`prefers-reduced-motion`** honrado globalmente

## Setup

```bash
bun install
cp .env.example .env.local
# Edite .env.local e adicione OPENAI_API_KEY=sk-...
bun dev
```

Abra http://localhost:3000

### Build de produção

```bash
bun run build
bun start
```

## Variáveis de ambiente

| Variável | Obrigatória? | Para quê |
|----------|--------------|----------|
| `OPENAI_API_KEY` | Recomendada | Onboarding conversacional inteligente (gpt-5.1) + classificação do sonho + transcrição de áudio (Whisper). **Sem esta chave, o protótipo cai automaticamente em fallbacks locais** que mantêm a demo viável mas perdem o "uau" da inteligência real. |

## Rotas

| Rota | O que é |
|------|---------|
| `/` | Home institucional |
| `/comece` | Chat de onboarding stateful (5 campos via gpt-5.1) |
| `/comece/sonho` | Pergunta do sonho + classificação cinematográfica |
| `/planejamento` | Grid de categorias na ordem do perfil detectado |
| `/planejamento/[categoria]` | Lista de profissionais curados |
| `/oferta/[slug]` | Perfil de profissional (galeria, pacotes, reviews) |
| `/meu-casamento` | Dashboard com progresso, gatilhos mentais e próximo passo |
| `/checkout` | Mood board automático + confirmação simulada + celebração |
| `/casamento/[slug]` | Site editorial gerado a partir dos dados do casal |

## Os 7 momentos de inteligência

Cada um deles é construído deliberadamente — é onde a demo vende o produto:

1. **Chat de onboarding** — gpt-5.1 parseia respostas multi-campo numa só mensagem
2. **Classificação do sonho** — IA classifica texto livre em 1 dos 5 perfis
3. **Caminho personalizado** — categorias na ordem do perfil
4. **Cards com social proof específico** — específico ao perfil + cidade
5. **Gatilhos no dashboard** — rule engine puro avalia estado em tempo real
6. **Mood board no checkout** — colagem automática das capas dos escolhidos
7. **Site do casamento** — gerado em segundos com todos os dados

## Os 5 perfis de casamento

- **Clássico Atemporal** — tradição, elegância, formal
- **Íntimo & Emocional** — pequeno, emoção, conexão
- **Minimalista Moderno** — design contemporâneo, sóbrio
- **Natureza & Destination** — ar livre, verde, praia
- **Grande Celebração** — muitos convidados, festa até tarde

## Os 13 venues Welucci

A categoria `local` usa os 13 espaços reais Welucci com URLs de imagens diretas do welucci.com. As outras 8 categorias usam profissionais mockados com fotos do Unsplash.

## Arquitetura

```
src/
├── app/                    # Rotas (App Router Next 16)
│   ├── api/                # Route Handlers gpt-5.1
│   ├── comece/             # Onboarding
│   ├── planejamento/       # Caminho + categoria
│   ├── oferta/[slug]/      # Perfil profissional
│   ├── meu-casamento/      # Dashboard
│   ├── checkout/           # Confirmação
│   └── casamento/[slug]/   # Site gerado
├── components/
│   ├── ui/                 # shadcn customizado (Button, Card, etc)
│   ├── ornaments/          # Divider, Ornament, Overline
│   ├── layout/             # Logo, navbars
│   ├── home/               # Seções da home
│   ├── onboarding/         # ChatBubble, AudioRecorder, DreamLoading
│   ├── planejamento/       # CategoryCard, VendorCard, ProgressFooter
│   ├── oferta/             # Lightbox
│   ├── checkout/           # CelebrationScreen
│   ├── triggers/           # 4 variantes + renderer
│   └── providers/          # CoupleProvider (hidratação Zustand)
├── data/                   # Dados estáticos (perfis, venues, vendors, triggers)
├── lib/                    # Helpers puros, fakes, prompts, OpenAI client
├── store/                  # Zustand store
└── types.ts                # Types compartilhados
```

## Notas técnicas

- **Hidratação Zustand:** o store usa `skipHydration: true` e o `CoupleProvider` chama `rehydrate()` em useEffect — único caminho seguro contra hydration mismatch no Next 16 App Router.
- **Triggers:** rule engine puro em `src/lib/evaluate-triggers.ts`. Avaliado via seletor Zustand (não useEffect) para performance e idempotência. Gatilhos com `once: true` gravam em `fired_once_triggers[]`.
- **Structured Outputs:** todas as chamadas à OpenAI usam `response_format: json_schema strict` — JSON garantido pelo modelo, sem regex sobre texto.
- **Imagens:** `next/image` com `sizes` correto em cada uso, `priority` só no LCP do hero, `formats: ['avif', 'webp']` no `next.config.ts`.

## Notas estéticas (DNA we.wedme)

Referências: Aman Resorts, Dior Couture, Loro Piana, Cereal Magazine.

**Anti-referências:** Airbnb (cantos arredondados), Zola/The Knot (catálogo), templates shadcn sem custom.

Regras invioláveis no código:
- `font-medium` máximo em headings display — **NUNCA** `font-bold`
- `rounded-sm` em CTAs — **NUNCA** `rounded-full`
- Sem cinza puro (slate/gray) — usar `border` (mauve `#B39EA9`) ou `muted` (bege `#FAEDD2`)
- Sem emoji em UI exceto 🎉 (celebração), 🎤 (gravar áudio), ✨/◇ (ornamento)
- Transições `duration-200`/`300`, nunca >500ms exceto entradas

## Status

Protótipo funcional. Todas as 9 rotas do briefing implementadas com fallbacks locais para funcionar mesmo sem `OPENAI_API_KEY`. Pronto para deploy na Vercel quando o repositório for configurado.
