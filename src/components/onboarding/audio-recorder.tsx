"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square } from "lucide-react";
import { motion } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

/**
 * Modal de gravação de áudio para `/comece/sonho`.
 *
 * - Usa MediaRecorder API
 * - Timer visível
 * - Máximo 3 minutos
 * - Ao parar, faz upload pra /api/transcribe (Whisper)
 * - Se response 503 → desabilita + tooltip
 *
 * Mobile: bottom sheet via vaul Drawer
 * Desktop: centered (vaul também trata bem)
 */
export function AudioRecorder({
  open,
  onOpenChange,
  onTranscribed,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onTranscribed: (text: string) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopAll = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Para o MediaRecorder se ainda ativo (evita estado anômalo)
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      try {
        rec.stop();
      } catch {
        // ignora erros de stop em estado já parado
      }
    }
    // Para os tracks de áudio (libera microfone)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  // Cleanup ao fechar modal
  useEffect(() => {
    if (!open) {
      stopAll();
      setIsRecording(false);
      setSeconds(0);
      setError(null);
      setIsProcessing(false);
    }
  }, [open, stopAll]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await sendForTranscription(blob);
      };

      recorder.start();
      setIsRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= 179) {
            stopRecording();
            return 180;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function sendForTranscription(blob: Blob) {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "audio.webm");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (res.status === 503) {
        setError("Transcrição indisponível neste momento. Use o texto.");
        setIsProcessing(false);
        return;
      }

      if (!res.ok) throw new Error("Falha na transcrição");

      const data = await res.json();
      if (data.text) {
        onTranscribed(data.text);
        onOpenChange(false);
      }
    } catch {
      setError("Não conseguimos processar o áudio. Tentem de novo.");
    } finally {
      setIsProcessing(false);
      stopAll();
    }
  }

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeDisplay = `${minutes}:${secs.toString().padStart(2, "0")}`;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-background">
        <div className="mx-auto w-full max-w-md safe-bottom px-6 py-8 md:py-10">
          <DrawerHeader className="text-center px-0 pb-6">
            <DrawerTitle className="font-display text-2xl md:text-3xl font-medium tracking-editorial">
              {isProcessing
                ? "Transcrevendo..."
                : isRecording
                  ? "Gravando"
                  : "Gravar áudio"}
            </DrawerTitle>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {isProcessing
                ? "Estamos transcrevendo o que vocês disseram."
                : isRecording
                  ? "Falem o que vier ao coração. Toque para parar."
                  : "Conta pra gente, sem pressa. Máximo 3 minutos."}
            </p>
          </DrawerHeader>

          <div className="flex flex-col items-center gap-6 py-8">
            <p
              className="font-display text-5xl md:text-6xl text-foreground tracking-editorial tabular-nums"
              aria-live="polite"
            >
              {timeDisplay}
            </p>

            {!isRecording && !isProcessing && (
              <button
                type="button"
                onClick={startRecording}
                aria-label="Iniciar gravação"
                className="flex items-center justify-center w-24 h-24 rounded-full bg-primary text-primary-foreground hover:bg-brand-wine transition-colors duration-200 active:scale-95"
              >
                <Mic className="size-9" />
              </button>
            )}

            {isRecording && (
              <motion.button
                type="button"
                onClick={stopRecording}
                aria-label="Parar gravação"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center justify-center w-24 h-24 rounded-full bg-destructive text-white"
              >
                <Square className="size-8 fill-white" />
              </motion.button>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-muted">
                <span className="text-[color:var(--brand-rose)] text-3xl animate-pulse-ornament">
                  ◇
                </span>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center mt-4">{error}</p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
