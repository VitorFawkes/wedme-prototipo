"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, Music2, Heart } from "lucide-react";
import { Overline } from "@/components/ornaments/overline";
import { useCouple } from "@/store/couple";

/**
 * Personalize seu site do casamento.
 *
 * Formulário inline-editable dentro de /meu-casamento. Permite adicionar
 * campos ricos que deixam o /casamento/[slug] mais personalizado:
 * - dance_song: "A primeira música do casamento"
 * - how_they_met: breve história de como se conheceram
 */
export function PersonalizeSite() {
  const dance_song = useCouple((s) => s.dance_song);
  const how_they_met = useCouple((s) => s.how_they_met);
  const updateRichData = useCouple((s) => s.updateRichData);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [editingSong, setEditingSong] = useState(false);
  const [editingStory, setEditingStory] = useState(false);
  const [songDraft, setSongDraft] = useState("");
  const [storyDraft, setStoryDraft] = useState("");

  function startEditSong() {
    setSongDraft(dance_song ?? "");
    setEditingSong(true);
  }
  function saveSong() {
    updateRichData({ dance_song: songDraft.trim() || null });
    setEditingSong(false);
  }

  function startEditStory() {
    setStoryDraft(how_they_met ?? "");
    setEditingStory(true);
  }
  function saveStory() {
    updateRichData({ how_they_met: storyDraft.trim() || null });
    setEditingStory(false);
  }

  if (!hydrated) return null;

  return (
    <section>
      <div className="mb-5">
        <Overline className="mb-2">Personalize</Overline>
        <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-editorial">
          Deixem o site de vocês mais rico
        </h2>
        <p className="text-sm md:text-base text-muted-foreground mt-2 leading-relaxed max-w-2xl">
          O site do casamento que vocês vão compartilhar por WhatsApp fica{" "}
          <strong className="text-foreground font-medium">
            muito mais bonito
          </strong>{" "}
          com detalhes pessoais. Sem pressão, tudo é opcional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Card: Música */}
        <div className="bg-card border border-border rounded-md p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center justify-center size-9 rounded-full bg-primary/10 text-primary shrink-0">
              <Music2 className="size-4" />
            </span>
            <Overline>A trilha do nosso dia</Overline>
          </div>
          <h3 className="font-display text-lg md:text-xl text-foreground tracking-editorial leading-tight mb-2">
            {dance_song
              ? "Primeira música"
              : "Qual música vai abrir a pista?"}
          </h3>

          {editingSong ? (
            <div className="mt-3">
              <input
                type="text"
                value={songDraft}
                onChange={(e) => setSongDraft(e.target.value)}
                placeholder="Ex: At Last — Etta James"
                autoFocus
                style={{ fontSize: "16px" }}
                className="w-full h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveSong();
                  if (e.key === "Escape") setEditingSong(false);
                }}
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={saveSong}
                  className="inline-flex items-center justify-center gap-1.5 min-h-10 px-4 rounded-sm bg-primary text-primary-foreground text-xs font-medium tracking-wide hover:bg-brand-wine transition-colors"
                >
                  <Check className="size-3.5" /> Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSong(false)}
                  className="inline-flex items-center justify-center min-h-10 px-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              {dance_song ? (
                <p className="font-display italic text-base md:text-lg text-muted-foreground leading-relaxed">
                  &ldquo;{dance_song}&rdquo;
                </p>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  A música que vai marcar a entrada, a valsa ou o fim da festa.
                </p>
              )}
              <button
                type="button"
                onClick={startEditSong}
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary font-medium hover:underline"
              >
                <Pencil className="size-3.5" />
                {dance_song ? "Editar" : "Adicionar"}
              </button>
            </>
          )}
        </div>

        {/* Card: História */}
        <div className="bg-card border border-border rounded-md p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center justify-center size-9 rounded-full bg-primary/10 text-primary shrink-0">
              <Heart className="size-4" />
            </span>
            <Overline>Nossa história</Overline>
          </div>
          <h3 className="font-display text-lg md:text-xl text-foreground tracking-editorial leading-tight mb-2">
            {how_they_met ? "Como começou" : "Como vocês se conheceram?"}
          </h3>

          {editingStory ? (
            <div className="mt-3">
              <textarea
                value={storyDraft}
                onChange={(e) => setStoryDraft(e.target.value)}
                placeholder="Um parágrafo contando o início de vocês..."
                rows={4}
                autoFocus
                style={{ fontSize: "16px" }}
                className="w-full rounded-sm border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary leading-relaxed resize-none"
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={saveStory}
                  className="inline-flex items-center justify-center gap-1.5 min-h-10 px-4 rounded-sm bg-primary text-primary-foreground text-xs font-medium tracking-wide hover:bg-brand-wine transition-colors"
                >
                  <Check className="size-3.5" /> Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStory(false)}
                  className="inline-flex items-center justify-center min-h-10 px-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              {how_they_met ? (
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
                  {how_they_met}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Um parágrafo sobre o começo. É o que mais emociona quem abrir
                  o site.
                </p>
              )}
              <button
                type="button"
                onClick={startEditStory}
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary font-medium hover:underline"
              >
                <Pencil className="size-3.5" />
                {how_they_met ? "Editar" : "Adicionar"}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
