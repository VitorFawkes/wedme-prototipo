# Agent Handoff — wedme-prototipo

> **Atenção próximo agente:** este arquivo é o ponto de entrada para qualquer agente que pegar este projeto. Ele resume o que é, como deployar, e o estado atual de mudanças não publicadas.
>
> **Sempre leia este arquivo PRIMEIRO**, depois `AGENTS.md` (regras do Next.js 16) e o `README.md` (visão de produto).

---

## O que é este projeto

Protótipo navegável de demonstração da plataforma **we.wedme** (curadoria de casamentos). Front-end puro Next.js 16 + TypeScript + Tailwind v4, sem backend próprio. Estado do casal vive no `localStorage` via Zustand. Uma única integração externa: OpenAI gpt-5.1 + Whisper.

**É um repositório separado do produto real.** O produto real (com Supabase, auth, admin) está em [VitorFawkes/we.wedme](https://github.com/VitorFawkes/we.wedme), em outro diretório (`/Users/vitorgambetti/Documents/we.wedme`). Não confunda nem misture commits.

- **Diretório local:** `/Users/vitorgambetti/Documents/wedmewelucci/wedme`
- **GitHub:** https://github.com/VitorFawkes/wedme-prototipo (privado, owner `VitorFawkes`)
- **Branch:** `main` (única, push direto)
- **Vercel:** https://wedme-prototipo.vercel.app
  - Project ID: `prj_VEGJjmQvs5gWjeywMETPJGp6XO2T`
  - Account team ID: `team_1IlbkxagdouzW5mZ4Pc15Oa3`
  - Auto-deploy on push to `main`
  - Env vars necessárias: **`OPENAI_API_KEY`** (production + preview + development)

---

## Stack rápida

| Camada | Versão / lib |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack default) |
| Runtime | **Bun** (`bun dev`, `bun run build`, `bun run start`) |
| TS | strict |
| Estilo | Tailwind v4 + base-ui via shadcn (não shadcn-ui clássico) |
| Estado | Zustand com `persist` no localStorage |
| Animação | Framer Motion (só `transform`/`opacity`) |
| IA | OpenAI gpt-5.1 via `openai` SDK + Whisper, ambos via Route Handlers |
| Fontes | Cormorant Garamond + Inter (`next/font/google`) |
| Mobile drawer | `vaul` |

**ATENÇÃO** — não é o Next.js que sua memória de treino conhece. Leia `node_modules/next/dist/docs/` antes de qualquer mudança que toque em rotas, params, generateMetadata, etc. `AGENTS.md` reforça isso.

---

## Premissa fundamental: Mobile-first sem exceção

- Touch targets ≥ 44×44px sempre
- `100dvh` / `100svh`, **nunca** `vh` puro (iOS Safari quebra)
- Safe areas (`safe-top`, `safe-bottom`) em qualquer elemento fixed
- Inputs com `font-size: 16px` mínimo (previne zoom iOS)
- Sem horizontal scroll, **nunca**

Antes de qualquer mudança visual: validar em 390px (mobile) E 1440px (desktop).

---

## Estrutura crítica

```
src/
├── app/
│   ├── api/
│   │   ├── onboarding-step/route.ts   # gpt-5.1 multi-campo (Structured Outputs)
│   │   ├── classify-dream/route.ts    # gpt-5.1 classifica em 5 perfis
│   │   └── transcribe/route.ts        # Whisper
│   ├── comece/page.tsx                # chat onboarding stateful
│   ├── comece/sonho/page.tsx          # pergunta do sonho + classificação
│   ├── planejamento/page.tsx          # grid de categorias do path do perfil
│   ├── planejamento/[categoria]/      # listagem de venues/vendors da cat
│   ├── oferta/[slug]/                 # perfil de venue ou vendor
│   ├── meu-casamento/page.tsx         # dashboard
│   ├── checkout/page.tsx              # mood board + confirmação
│   ├── casamento/[slug]/              # site editorial gerado
│   └── dev/seed/page.tsx              # ATALHO QA: 4 cenários pré-prontos
├── components/
│   ├── layout/                        # Logo, navbars, BackLink
│   ├── triggers/                      # 4 variantes (top_bar, inline, floating, modal) + renderer
│   ├── specialist/specialist-widget.tsx  # FAB "Falar com especialista" — agora arrastável e minimizável
│   └── ...
├── data/                              # mocks (profiles, venues, vendors, triggers, home, unsplash-library)
├── lib/                               # helpers, prompts, openai-client, evaluate-triggers, fakes
└── store/couple.ts                    # Zustand store
```

**Atalho de QA:** `/dev/seed` carrega 4 cenários pré-prontos (Íntimo, Clássico, Natureza, Grande). Use isso pra testar páginas internas sem refazer onboarding.

---

## Princípios não-negociáveis (aprendidos com bugs reais)

### 1. IA NUNCA usa travessões (— ou --)
Regra crítica no `src/lib/onboarding-prompt.ts`. Se for adicionar copy hardcoded em qualquer lugar do projeto também: usar vírgula, ponto, parênteses. Nunca em-dash. O usuário detecta e reclama.

### 2. Confusão "profissional" vs "espaço/local"
- Categoria `local` = venues (espaços Welucci). NUNCA chamar de "profissional".
- Outras 8 categorias (fotografia, buffet, etc) = profissionais.
- Triggers usam placeholders dinâmicos `{Este_tipo}` / `{deste_tipo}` resolvidos em `src/lib/evaluate-triggers.ts` baseado na categoria do vendor da página.

### 3. Cidade flexível
A IA NÃO força nome de cidade exato. "Praia em SP" grava `city="Litoral de SP", state="SP"` e segue. "Campo", "interior", "litoral nordeste" também são válidos. Só pergunta de novo se for literalmente "não sei".

### 4. Zustand + persist + Next 16
Store em `src/store/couple.ts` usa `skipHydration: true`. O `CoupleProvider` em `src/components/providers/couple-provider.tsx` chama `rehydrate()` em useEffect no client. **Não mexer nesse padrão sem entender hidratação SSR/CSR.**

### 5. Triggers via seletor Zustand puro
`src/components/triggers/trigger-renderer.tsx` usa `useTriggers()` que avalia `evaluateTriggers()` em `useMemo`. Gatilhos `once: true` gravam em `fired_once_triggers[]`. Não usar `useEffect` para isso.

### 6. Imagens dos vendors vêm da biblioteca curada
`src/data/unsplash-library.ts` tem 8 categorias com IDs Unsplash **validados (HEAD 200)**. `vendors.ts` usa `buildVendorImages(category, vendorIndex)` — NÃO adicionar IDs hardcoded em vendors. Se precisar trocar imagem, troque na biblioteca.

### 7. Personalização por dream_text
`src/lib/couple-helpers.ts` tem `scoreVendor()` + `sortVendorsForProfile()` que ranqueia vendors por: `example_venues` do perfil + keywords do `dream_text` que aparecem na bio + match de cidade/região + tiebreaker determinístico. Quando renderizar listagem de vendors, sempre passar `dreamText` e `city` do store.

### 8. FAB "Falar com especialista" arrastável
`src/components/specialist/specialist-widget.tsx`. Recente: virou arrastável + minimizável + persistente. Não voltar pra fixed estático. Se mover, validar que não cobre CTAs em todas as páginas do casal.

### 9. Botão "Reiniciar simulação"
No `CoupleNavbar` (canto superior direito), visível em todas as páginas internas. Limpa o `wewedme-couple` do localStorage e redireciona pra `/`. **Imprescindível** para QA repetido.

### 10. CTAs editoriais, não SaaS
- Logo no topo SEMPRE volta pra `/` (em qualquer página interna).
- "Voltar para X" usa o componente `BackLink` em `src/components/layout/back-link.tsx`.
- Padronizar CTAs: "Ver opções" (lista de cat), "Ver perfil" (vendor card), "Ver pacotes" (oferta).

---

## Como deployar mudanças

### Setup local
```bash
cd /Users/vitorgambetti/Documents/wedmewelucci/wedme
bun install
cp .env.example .env.local
# Editar .env.local: OPENAI_API_KEY=sk-proj-...
bun dev   # localhost:3000 (ou PORT=3001 bun dev se 3000 ocupado)
```

### Validação local (obrigatória antes de push)
```bash
bun run build     # tem que passar verde
```

### Commit
```bash
git add -A
git commit -m "tipo: descrição curta

Detalhes do que mudou e por quê.

Co-Authored-By: ...
"
```

### Push (auto-deploy Vercel)
```bash
git push
```

Auto-deploy demora ~30-60s. Pode monitorar via Vercel API se tiver token (veja seção abaixo).

### Deploy manual via Vercel API (sem CLI)

Se precisar configurar env vars, redeployar sem push, ou ler logs sem dashboard:

```bash
export VERCEL_TOKEN="<token criado em vercel.com/account/tokens>"
PROJECT_ID="prj_VEGJjmQvs5gWjeywMETPJGp6XO2T"

# Listar env vars
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID/env" | python3 -m json.tool

# Adicionar env var
curl -s -X POST -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v10/projects/$PROJECT_ID/env?upsert=true" \
  -d '{
    "key": "OPENAI_API_KEY",
    "value": "sk-proj-...",
    "type": "encrypted",
    "target": ["production", "preview", "development"]
  }'

# Redeploy último (sem push)
LAST_DEPLOY=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['deployments'][0]['uid'])")

curl -s -X POST -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v13/deployments" \
  -d "{
    \"name\": \"wedme-prototipo\",
    \"project\": \"$PROJECT_ID\",
    \"target\": \"production\",
    \"deploymentId\": \"$LAST_DEPLOY\"
  }"

# Status do último deploy
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=1" \
  | python3 -c "import sys,json; d=json.load(sys.stdin)['deployments'][0]; print('state:', d['state'], 'uid:', d['uid'])"
```

**NUNCA commitar `VERCEL_TOKEN` ou `OPENAI_API_KEY`.** Usar sempre via env var do shell.

---

## Estado atual de mudanças NÃO publicadas

> Atualizar esta seção sempre que receber edits do usuário e antes de fazer commit.

**Working tree:** 3 arquivos modificados pelo usuário (não commitados ainda):

### 1. `src/components/home/hero.tsx`
**O que mudou:** Hero copy reescrito.
- Removeu Overline "Curadoria de casamentos"
- Removeu o "do início ao fim" e "três minutos..."
- Novo título: **"Planejar seu casamento pode ser fácil, feliz e sem burocracia."**
- Novo subtítulo: **"Faça como mais de 1.200 casais."**
- `text-balance` adicionado ao h1
- Container de `max-w-3xl` → `max-w-4xl`
- CTA "Planejar meu casamento" mantido

**Por quê:** copy mais direto, menos editorial-clichê. Foca no "fácil/feliz/sem burocracia" e em prova social numérica.

### 2. `src/data/home.ts` (homeNumbers)
**O que mudou:** os 3 números genéricos viraram **4 números específicos da Welucci**:
```ts
export const homeNumbers = [
  { value: "+1.500", label: "Casamentos realizados nos últimos anos" },
  { value: "+12", label: "Opções de espaços disponíveis" },
  { value: "+1.000", label: "Pessoas fazem parte da Welucci" },
  { value: "NPS 65", label: "A única empresa no mercado de eventos a medir o NPS" },
] as const;
```

### 3. `src/components/home/numbers.tsx`
**O que mudou:** grid passou de 3 colunas (`sm:grid-cols-3`) para responsivo de 4 colunas (`sm:grid-cols-2 lg:grid-cols-4`) pra acomodar o quarto número.
- `gap-8 md:gap-16` → `gap-10 md:gap-8`
- Comentário atualizado para refletir as novas colunas

**Por quê:** o usuário quer mostrar o NPS como diferencial competitivo + falar do tamanho real da Welucci ("+1.000 pessoas no time").

---

### 4. (já no GitHub e em produção) FAB Specialist arrastável

Commit `d1f13b4` `feat(specialist): FAB arrastável e minimizável com persistência` já está no `origin/main` e deployado em produção. O próximo agente NÃO precisa pushar de novo, só verificar se as mudanças do hero/numbers (não commitadas ainda) precisam ir junto.

Para confirmar o que já está publicado vs local:
```bash
git fetch origin main
git log origin/main..main --oneline   # tudo que está local mas NÃO no GitHub
git log main..origin/main --oneline   # tudo que está no GitHub mas NÃO local
```

---

## Como pegar essa entrega e publicar (próximo agente)

1. **Validar build local:**
   ```bash
   cd /Users/vitorgambetti/Documents/wedmewelucci/wedme
   bun run build
   ```
   Se falhar: corrigir antes de qualquer commit.

2. **Conferir o commit pendente do FAB:**
   ```bash
   git log origin/main..main --oneline
   ```
   Se mostrar commits que não estão em `origin/main`, eles vão junto no próximo push.

3. **Commit das mudanças do hero/numbers:**
   ```bash
   git add src/components/home/hero.tsx src/components/home/numbers.tsx src/data/home.ts
   git commit -m "feat(home): hero copy direto e 4 números reais da Welucci

   - Hero: 'Planejar seu casamento pode ser fácil, feliz e sem burocracia'
   - Subtítulo: 'Faça como mais de 1.200 casais'
   - Numbers: 4 estatísticas reais (1500 casamentos, 12 espaços, 1000 pessoas, NPS 65)
   - Grid de números agora 4 colunas responsivo
   "
   ```

4. **Push:**
   ```bash
   git push
   ```

5. **Monitorar deploy:**
   ```bash
   # Espera 5s, pega último deploy, espera ficar READY
   sleep 5
   export VERCEL_TOKEN="<seu token>"
   DID=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v6/deployments?projectId=prj_VEGJjmQvs5gWjeywMETPJGp6XO2T&limit=1" | python3 -c "import sys,json; print(json.load(sys.stdin)['deployments'][0]['uid'])")
   for i in 1 2 3 4 5 6 7 8 9 10; do
     s=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v13/deployments/$DID" | python3 -c "import sys,json; print(json.load(sys.stdin).get('readyState','?'))")
     echo "Try $i: $s"
     [ "$s" = "READY" ] && break
     [ "$s" = "ERROR" ] && break
     sleep 8
   done
   ```

6. **Validar visualmente:** abrir https://wedme-prototipo.vercel.app no iPhone real e checar:
   - Hero novo aparece com "Planejar seu casamento pode ser fácil, feliz e sem burocracia"
   - 4 números aparecem (1500, 12, 1000, NPS 65) em 1 col mobile, 2 col tablet, 4 col desktop
   - FAB Especialista arrasta e minimiza
   - Sem console errors

---

## Checklist de qualidade para qualquer mudança de copy

- [ ] Sem travessões (— ou --) em texto visível ao usuário
- [ ] "Profissional" só pra vendors (categorias != local). "Espaço" pra venues.
- [ ] Português brasileiro natural, sem ser infantil
- [ ] Mensagens de IA: 1-3 frases, não comentam tudo
- [ ] CTAs editoriais (não SaaS / técnico)
- [ ] Mobile 390px e desktop 1440px ambos OK

---

## Princípios de comunicação ao usuário

- Output direto, sem preamble desnecessário
- Não contar passo-a-passo do que fez se já está claro pelo resultado
- Quando errar, dizer onde errou e arrumar — não desculpas
- Quando o usuário relatar um bug visível, validar com Playwright/curl antes de assumir que entendeu
- Quando deployar, sempre confirmar via API que está READY antes de dizer "pronto"
