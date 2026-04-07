"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Music2, MapPin, Clock, Heart } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Ornament } from "@/components/ornaments/ornament";
import { Overline } from "@/components/ornaments/overline";
import { Divider } from "@/components/ornaments/divider";
import { useCouple } from "@/store/couple";
import {
  getCoupleSlug,
  getVendorOrVenueBySlug,
} from "@/lib/couple-helpers";
import { categories } from "@/data/categories";
import { formatDateExtended } from "@/lib/format";

/**
 * Site editorial do casamento (briefing §5.9 + benchmark Zola/Joy/The Knot).
 *
 * Este é o grand finale — o que o casal compartilha por WhatsApp. Precisa ser
 * DENSO de conteúdo mas sempre mobile-first: é quase sempre aberto no celular.
 *
 * Seções (na ordem):
 * 1. Hero 100svh com nomes + data + cover do venue
 * 2. Contagem regressiva grande
 * 3. Nossa história (how_they_met + dream_text)
 * 4. A trilha do nosso dia (dance_song, se preenchida)
 * 5. O local
 * 6. Galeria rica (combinada dos profissionais)
 * 7. Linha do tempo do dia (mock inteligente)
 * 8. Quem faz parte do nosso dia
 * 9. Save the date
 * 10. Footer
 */
export function CasamentoClient({ slug }: { slug: string }) {
  const router = useRouter();
  const partner_1_name = useCouple((s) => s.partner_1_name);
  const partner_2_name = useCouple((s) => s.partner_2_name);
  const wedding_date = useCouple((s) => s.wedding_date);
  const city = useCouple((s) => s.city);
  const state = useCouple((s) => s.state);
  const guest_count = useCouple((s) => s.guest_count);
  const dream_text = useCouple((s) => s.dream_text);
  const how_they_met = useCouple((s) => s.how_they_met);
  const dance_song = useCouple((s) => s.dance_song);
  const selections = useCouple((s) => s.selections);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando…</p>
      </main>
    );
  }

  // Slug check
  const expectedSlug = getCoupleSlug(partner_1_name, partner_2_name);
  if (slug !== expectedSlug || !partner_1_name) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center bg-background px-6 text-center">
        <Ornament size="lg" className="mb-6" />
        <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground tracking-editorial mb-4">
          Site não encontrado
        </h1>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Este site é gerado após o casal completar o onboarding e escolhas.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-12 px-6 rounded-sm bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-brand-wine transition-colors"
        >
          Voltar ao início
        </Link>
      </main>
    );
  }

  const venueSelection = selections.find((s) => s.category_slug === "local");
  const venue = venueSelection
    ? getVendorOrVenueBySlug(venueSelection.vendor_slug)
    : null;
  const heroImage =
    venue?.cover ??
    "https://welucci.com/wp-content/uploads/2026/01/Capa-principal-Home_11zon-scaled.jpg";

  // Combina portfolios de TODOS os profissionais escolhidos
  const richGallery = selections
    .flatMap((s) => {
      const v = getVendorOrVenueBySlug(s.vendor_slug);
      return v?.portfolio.slice(0, 3) ?? [];
    })
    .slice(0, 12);

  return (
    <main className="bg-background">
      {/* Barra de navegação fixa sutil */}
      <nav className="fixed top-0 left-0 right-0 z-40 safe-top bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center min-h-11 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar
          </Link>
          <button
            type="button"
            onClick={() => {
              useCouple.getState().reset();
              router.replace("/");
            }}
            className="inline-flex items-center justify-center min-h-11 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Reiniciar
          </button>
        </div>
      </nav>
      {/* ====================================================
          1. HERO 100svh
      ==================================================== */}
      <section className="relative min-h-[100svh] flex items-center justify-center isolate overflow-hidden">
        <Image
          src={heroImage}
          alt={`Local do casamento de ${partner_1_name} e ${partner_2_name}`}
          fill
          priority
          sizes="100vw"
          className="object-cover -z-10"
        />
        <div
          className="absolute inset-0 -z-10 bg-foreground/70"
          aria-hidden="true"
        />

        <div className="relative px-6 md:px-12 py-24 md:py-32 text-center max-w-3xl mx-auto safe-top safe-bottom text-white">
          <Ornament size="md" className="mb-6 md:mb-8" />
          <Overline className="!text-white/70 mb-6 md:mb-8">Casamento</Overline>

          <h1 className="font-display font-medium text-white leading-[0.95] tracking-editorial">
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
              {partner_1_name}
            </span>
            <span className="block text-3xl md:text-5xl my-3 md:my-5 text-[color:var(--brand-rose)]">
              &
            </span>
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
              {partner_2_name}
            </span>
          </h1>

          {wedding_date && (
            <p className="font-display text-lg md:text-2xl text-white/90 mt-8 md:mt-12 tracking-editorial">
              {formatDateExtended(wedding_date)}
            </p>
          )}
          {city && (
            <p className="text-sm md:text-base text-white/70 mt-2 tracking-wide">
              {city}
              {state && `, ${state}`}
            </p>
          )}
        </div>
      </section>

      {/* ====================================================
          2. CONTAGEM REGRESSIVA
      ==================================================== */}
      {wedding_date && <Countdown weddingDate={wedding_date} />}

      {/* ====================================================
          3. NOSSA HISTÓRIA (expandida)
      ==================================================== */}
      {how_they_met && (
        <section className="py-20 md:py-32 px-6 md:px-12 bg-background">
          <div className="max-w-3xl mx-auto text-center">
            <Divider />
            <Overline className="mb-4 md:mb-6">Nossa história</Overline>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-normal text-foreground tracking-editorial leading-tight mb-10 md:mb-14">
              Como tudo começou
            </h2>
            <p className="text-base md:text-lg text-foreground leading-relaxed max-w-2xl mx-auto">
              {how_they_met}
            </p>
          </div>
        </section>
      )}

      {/* ====================================================
          4. A TRILHA DO NOSSO DIA (se dance_song preenchida)
      ==================================================== */}
      {dance_song && (
        <section className="py-16 md:py-24 px-6 md:px-12 bg-muted text-center">
          <div className="max-w-xl mx-auto">
            <div className="inline-flex items-center justify-center size-14 md:size-16 rounded-full bg-primary text-primary-foreground mb-6">
              <Music2 className="size-6 md:size-7" aria-hidden="true" />
            </div>
            <Overline className="mb-3">A trilha do nosso dia</Overline>
            <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-normal text-foreground tracking-editorial leading-tight mb-4">
              A primeira música
            </h2>
            <p className="font-display italic text-2xl md:text-3xl text-muted-foreground leading-relaxed">
              &ldquo;{dance_song}&rdquo;
            </p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-6">
              A música que vai marcar esse dia
            </p>
          </div>
        </section>
      )}

      {/* ====================================================
          5. O LOCAL
      ==================================================== */}
      {venue && (
        <section className="py-20 md:py-32 px-6 md:px-12 bg-background">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <Divider />
              <Overline className="mb-4">O Local</Overline>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-normal text-foreground tracking-editorial leading-tight">
                Onde a gente se encontra
              </h2>
            </div>

            <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-md overflow-hidden mb-8">
              <Image
                src={venue.cover}
                alt={venue.name}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover"
              />
            </div>

            <div className="text-center max-w-2xl mx-auto">
              <h3 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-editorial mb-2">
                {venue.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden="true" />
                {venue.city}
                {venue.state && `, ${venue.state}`}
                {venue.neighborhood && ` · ${venue.neighborhood}`}
              </p>
              <p className="font-display italic text-base md:text-lg text-muted-foreground leading-relaxed">
                {venue.tagline}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================
          6. GALERIA RICA (combinada dos profissionais)
      ==================================================== */}
      {richGallery.length > 0 && (
        <section className="py-20 md:py-32 px-4 md:px-12 bg-muted">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16 px-2">
              <Overline className="mb-4">Atmosfera</Overline>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-normal text-foreground tracking-editorial leading-tight">
                O clima que a gente
                <br />
                imagina para o dia
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {richGallery.map((img, i) => (
                <div
                  key={`${img}-${i}`}
                  className="relative aspect-square rounded-sm overflow-hidden bg-background"
                >
                  <Image
                    src={img}
                    alt={`Atmosfera ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================
          7. LINHA DO TEMPO DO DIA (mock inteligente)
      ==================================================== */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <Divider />
            <Overline className="mb-4">Programação</Overline>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-normal text-foreground tracking-editorial leading-tight">
              O ritmo do dia
            </h2>
          </div>

          <ol className="space-y-8 md:space-y-10 max-w-lg mx-auto">
            <TimelineItem
              time="16:00"
              title="Recepção"
              description="Welcome drink e acolhida no jardim"
            />
            <TimelineItem
              time="17:00"
              title="Cerimônia"
              description="O momento que tudo muda"
            />
            <TimelineItem
              time="18:00"
              title="Coquetel"
              description="Pra comer, beber e descansar os pés"
            />
            <TimelineItem
              time="20:00"
              title="Jantar"
              description="O menu que a gente escolheu com carinho"
            />
            <TimelineItem
              time="22:00"
              title="Festa"
              description={dance_song ? `Começando com "${dance_song}"` : "Pista aberta até dar conta"}
              last
            />
          </ol>
        </div>
      </section>

      {/* ====================================================
          8. QUEM FAZ PARTE DO NOSSO DIA
      ==================================================== */}
      {selections.length > 0 && (
        <section className="py-20 md:py-32 px-6 md:px-12 bg-muted">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <Overline className="mb-4">Curadoria</Overline>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-normal text-foreground tracking-editorial leading-tight">
                Quem faz parte
                <br />
                do nosso dia
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {selections.map((selection) => {
                const vendor = getVendorOrVenueBySlug(selection.vendor_slug);
                const category = categories.find(
                  (c) => c.slug === selection.category_slug,
                );
                if (!vendor || !category) return null;
                return (
                  <article
                    key={selection.category_slug}
                    className="group bg-card border border-border rounded-md overflow-hidden"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <Image
                        src={vendor.cover}
                        alt={`${vendor.name}, ${category.name}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 md:p-6">
                      <Overline className="mb-1.5">{category.name}</Overline>
                      <p className="font-display text-xl md:text-2xl text-foreground tracking-editorial leading-tight">
                        {vendor.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {vendor.city}
                        {vendor.state && `, ${vendor.state}`}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================
          9. SAVE THE DATE
      ==================================================== */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-background text-center">
        <div className="max-w-2xl mx-auto">
          <Divider />
          <Overline className="mb-4">Save the date</Overline>
          <p className="font-display text-2xl md:text-3xl text-muted-foreground tracking-editorial mb-4">
            Esperamos vocês em
          </p>
          {wedding_date && (
            <p className="font-display text-3xl md:text-5xl text-foreground tracking-editorial leading-tight mb-3">
              {formatDateExtended(wedding_date)}
            </p>
          )}
          {venue && (
            <p className="font-display text-xl md:text-2xl text-muted-foreground tracking-editorial mt-4">
              {venue.name}
            </p>
          )}
          {city && (
            <p className="text-sm md:text-base text-muted-foreground mt-2 tracking-wide">
              {city}
              {state && `, ${state}`}
            </p>
          )}

          {guest_count && (
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-8 flex items-center justify-center gap-1.5">
              <Heart className="size-3" />
              Uma celebração para {guest_count} convidados
            </p>
          )}
        </div>
      </section>

      {/* ====================================================
          10. FOOTER
      ==================================================== */}
      <footer className="py-12 md:py-16 px-6 md:px-12 bg-foreground text-background safe-bottom">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-background/70 tracking-wide mb-2">
            Planejado com carinho pela
          </p>
          <Link href="/" className="inline-block">
            <Logo variant="light" className="text-2xl md:text-3xl" />
          </Link>
        </div>
      </footer>
    </main>
  );
}

// ============================================================
// Subcomponentes
// ============================================================

function Countdown({ weddingDate }: { weddingDate: string }) {
  const [now, setNow] = useState(() => Date.now());

  // Atualiza por minuto, mas pausa quando a aba está em background
  // (Page Visibility API) — economiza bateria em mobile
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      setNow(Date.now()); // update imediato ao voltar
      interval = setInterval(() => setNow(Date.now()), 1000 * 60);
    };
    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    if (document.visibilityState === "visible") start();

    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const diff = useMemo(() => {
    // Parse wedding_date — pode ser YYYY-MM-DD ou YYYY-MM
    const parts = weddingDate.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parts[2] ? parseInt(parts[2], 10) : 15; // default meio do mês
    const target = new Date(year, month, day, 16, 0, 0).getTime();
    const ms = target - now;

    if (ms <= 0) return null;

    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    const weeks = Math.floor(days / 7);

    return { days, months, remainingDays, weeks };
  }, [weddingDate, now]);

  if (!diff) return null;

  return (
    <section className="py-16 md:py-24 px-6 md:px-12 bg-background text-center border-b border-border">
      <div className="max-w-2xl mx-auto">
        <Overline className="mb-4">Contagem regressiva</Overline>

        <div className="flex items-baseline justify-center gap-3 md:gap-6 flex-wrap">
          <div>
            <p className="font-display text-5xl md:text-7xl lg:text-8xl font-medium text-foreground leading-none tracking-editorial">
              {diff.days}
            </p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
              {diff.days === 1 ? "dia" : "dias"}
            </p>
          </div>
        </div>

        {diff.days > 30 && (
          <p className="mt-6 text-sm text-muted-foreground tracking-wide">
            Ou aproximadamente{" "}
            <strong className="text-foreground">{diff.months}</strong>{" "}
            {diff.months === 1 ? "mês" : "meses"} e{" "}
            <strong className="text-foreground">{diff.remainingDays}</strong>{" "}
            {diff.remainingDays === 1 ? "dia" : "dias"}
          </p>
        )}
        {diff.days <= 30 && diff.days > 7 && (
          <p className="mt-6 text-sm text-muted-foreground tracking-wide">
            Menos de {Math.ceil(diff.days / 7)} semanas.{" "}
            <strong className="text-foreground">Já tá em cima.</strong>
          </p>
        )}
        {diff.days <= 7 && (
          <p className="mt-6 text-sm text-foreground font-medium tracking-wide">
            É nesta semana. 🤍
          </p>
        )}
      </div>
    </section>
  );
}

function TimelineItem({
  time,
  title,
  description,
  last,
}: {
  time: string;
  title: string;
  description: string;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-5 md:gap-6">
      {/* Linha vertical */}
      {!last && (
        <div
          className="absolute left-[7px] top-5 bottom-[-3rem] w-px bg-border"
          aria-hidden="true"
        />
      )}
      {/* Marcador */}
      <div
        className="shrink-0 mt-1.5 size-3.5 rounded-full bg-primary relative z-10"
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-0.5">
          {time}
        </p>
        <h3 className="font-display text-xl md:text-2xl font-medium text-foreground tracking-editorial leading-tight mb-1">
          {title}
        </h3>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </li>
  );
}
