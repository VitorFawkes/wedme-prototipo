"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil, Check, Music2, Heart, Mic, Pause, Play, Send } from "lucide-react";
import { motion } from "framer-motion";
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

  // Mini gravador inline para os campos de personalização
  const [recording, setRecording] = useState<"song" | "story" | null>(null);
  const [recPaused, setRecPaused] = useState(false);
  const [recProcessing, setRecProcessing] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [recError, setRecError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function startRec(field: "song" | "story") {
    setRecError(null);
    setRecPaused(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.start();
      setRecording(field);
      setRecSeconds(0);
      timerRef.current = setInterval(() => {
        setRecSeconds((s) => { if (s >= 119) { pauseRec(); return 120; } return s + 1; });
      }, 1000);
    } catch { setRecError("Não foi possível acessar o microfone."); }
  }

  function pauseRec() {
    if (recorderRef.current?.state === "recording") recorderRef.current.pause();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setRecPaused(true);
  }

  function resumeRec() {
    if (recorderRef.current?.state === "paused") recorderRef.current.resume();
    setRecPaused(false);
    timerRef.current = setInterval(() => {
      setRecSeconds((s) => { if (s >= 119) { pauseRec(); return 120; } return s + 1; });
    }, 1000);
  }

  async function sendRec() {
    if (!recorderRef.current || !recording) return;
    const field = recording;
    setRecProcessing(true);
    setRecPaused(false);
    setRecording(null);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const rec = recorderRef.current;
    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      try {
        const fd = new FormData();
        fd.append("file", blob, "audio.webm");
        const res = await fetch("/api/transcribe", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Falha");
        const data = await res.json();
        if (data.text) {
          if (field === "song") updateRichData({ dance_song: data.text.trim() });
          else updateRichData({ how_they_met: data.text.trim() });
        }
      } catch { setRecError("Não conseguimos processar o áudio."); }
      finally {
        setRecProcessing(false);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        recorderRef.current = null;
      }
    };
    if (rec.state !== "inactive") rec.stop();
  }

  function discardRec() {
    if (recorderRef.current?.state !== "inactive") try { recorderRef.current?.stop(); } catch {}
    setRecording(null);
    setRecPaused(false);
    setRecSeconds(0);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }

  function restartRec(field: "song" | "story") {
    discardRec();
    setTimeout(() => startRec(field), 100);
  }

  const timeDisplay = `${Math.floor(recSeconds / 60)}:${(recSeconds % 60).toString().padStart(2, "0")}`;

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

          {/* Gravando áudio para música */}
          {recording === "song" || (recProcessing && !recording && !dance_song) ? (
            <div className="mt-3 flex flex-col items-center gap-2">
              {recProcessing ? (
                <div className="flex items-center gap-2 py-2">
                  <span className="text-[color:var(--brand-rose)] text-xl animate-pulse-ornament">◇</span>
                  <span className="text-sm text-muted-foreground">Transcrevendo...</span>
                </div>
              ) : recPaused ? (
                <>
                  <span className="font-display text-xl text-foreground tabular-nums">{timeDisplay}</span>
                  <div className="flex gap-2 w-full">
                    <button type="button" onClick={resumeRec} className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-10 rounded-sm border border-border bg-card text-foreground text-xs font-medium hover:border-primary transition-colors"><Play className="size-4" /> Retomar</button>
                    <button type="button" onClick={sendRec} className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-10 rounded-sm bg-primary text-primary-foreground text-xs font-medium hover:bg-brand-wine transition-colors"><Send className="size-3.5" /> Enviar</button>
                    <button type="button" onClick={() => restartRec("song")} className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-10 rounded-sm border border-border bg-card text-foreground text-xs font-medium hover:border-primary transition-colors"><Mic className="size-3.5" /> Recomeçar</button>
                  </div>
                </>
              ) : (
                <>
                  <span className="font-display text-xl text-foreground tabular-nums">{timeDisplay}</span>
                  <motion.button type="button" onClick={pauseRec} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive text-white"><Pause className="size-4 fill-white" /></motion.button>
                </>
              )}
            </div>
          ) : editingSong ? (
            <div className="mt-3">
              <input type="text" value={songDraft} onChange={(e) => setSongDraft(e.target.value)} placeholder="Ex: At Last, Etta James" autoFocus style={{ fontSize: "16px" }} className="w-full h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" onKeyDown={(e) => { if (e.key === "Enter") saveSong(); if (e.key === "Escape") setEditingSong(false); }} />
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={saveSong} className="inline-flex items-center justify-center gap-1.5 min-h-10 px-4 rounded-sm bg-primary text-primary-foreground text-xs font-medium tracking-wide hover:bg-brand-wine transition-colors"><Check className="size-3.5" /> Salvar</button>
                <button type="button" onClick={() => setEditingSong(false)} className="inline-flex items-center justify-center min-h-10 px-4 text-xs text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
              </div>
            </div>
          ) : (
            <>
              {dance_song ? (
                <p className="font-display italic text-base md:text-lg text-muted-foreground leading-relaxed">&ldquo;{dance_song}&rdquo;</p>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">A música que vai marcar a entrada, a valsa ou o fim da festa.</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <button type="button" onClick={() => startRec("song")} className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"><Mic className="size-3.5" /> Gravar áudio</button>
                <button type="button" onClick={startEditSong} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /> {dance_song ? "Editar texto" : "Digitar"}</button>
              </div>
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

          {/* Gravando áudio para história */}
          {recording === "story" || (recProcessing && !recording && !how_they_met) ? (
            <div className="mt-3 flex flex-col items-center gap-2">
              {recProcessing ? (
                <div className="flex items-center gap-2 py-2">
                  <span className="text-[color:var(--brand-rose)] text-xl animate-pulse-ornament">◇</span>
                  <span className="text-sm text-muted-foreground">Transcrevendo...</span>
                </div>
              ) : recPaused ? (
                <>
                  <span className="font-display text-xl text-foreground tabular-nums">{timeDisplay}</span>
                  <div className="flex gap-2 w-full">
                    <button type="button" onClick={resumeRec} className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-10 rounded-sm border border-border bg-card text-foreground text-xs font-medium hover:border-primary transition-colors"><Play className="size-4" /> Retomar</button>
                    <button type="button" onClick={sendRec} className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-10 rounded-sm bg-primary text-primary-foreground text-xs font-medium hover:bg-brand-wine transition-colors"><Send className="size-3.5" /> Enviar</button>
                    <button type="button" onClick={() => restartRec("story")} className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-10 rounded-sm border border-border bg-card text-foreground text-xs font-medium hover:border-primary transition-colors"><Mic className="size-3.5" /> Recomeçar</button>
                  </div>
                </>
              ) : (
                <>
                  <span className="font-display text-xl text-foreground tabular-nums">{timeDisplay}</span>
                  <motion.button type="button" onClick={pauseRec} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive text-white"><Pause className="size-4 fill-white" /></motion.button>
                </>
              )}
            </div>
          ) : editingStory ? (
            <div className="mt-3">
              <textarea
                value={storyDraft}
                onChange={(e) => setStoryDraft(e.target.value)}
                placeholder="Um parágrafo contando o início de vocês..."
                rows={3}
                autoFocus
                style={{ fontSize: "16px" }}
                className="w-full rounded-sm border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary leading-relaxed resize-none"
              />
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={saveStory} className="inline-flex items-center justify-center gap-1.5 min-h-10 px-4 rounded-sm bg-primary text-primary-foreground text-xs font-medium tracking-wide hover:bg-brand-wine transition-colors"><Check className="size-3.5" /> Salvar</button>
                <button type="button" onClick={() => setEditingStory(false)} className="inline-flex items-center justify-center min-h-10 px-4 text-xs text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
              </div>
            </div>
          ) : (
            <>
              {how_they_met ? (
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">{how_they_met}</p>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">É o que mais emociona quem abrir o site.</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <button type="button" onClick={() => startRec("story")} className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"><Mic className="size-3.5" /> Gravar áudio</button>
                <button type="button" onClick={startEditStory} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /> {how_they_met ? "Editar texto" : "Digitar"}</button>
              </div>
            </>
          )}
          {recError && <p className="text-xs text-destructive mt-2">{recError}</p>}
        </div>
      </div>
    </section>
  );
}
