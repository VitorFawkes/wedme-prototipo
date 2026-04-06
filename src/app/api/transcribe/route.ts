import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/transcribe
 *
 * Recebe multipart/form-data com `file` (audio) e devolve a transcrição
 * via OpenAI Whisper. Usado pelo bloco de gravação de áudio em /comece/sonho.
 *
 * Sem OPENAI_API_KEY → 503 (frontend desabilita o botão de áudio).
 */
export async function POST(req: Request) {
  const client = getOpenAIClient();
  if (!client) {
    return NextResponse.json(
      { error: "Transcrição indisponível — sem OPENAI_API_KEY" },
      { status: 503 },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Arquivo de áudio ausente" },
        { status: 400 },
      );
    }

    const audioFile = new File([file], "audio.webm", {
      type: file.type || "audio/webm",
    });

    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "pt",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (err) {
    console.error("[transcribe] erro:", err);
    return NextResponse.json(
      { error: "Falha na transcrição" },
      { status: 500 },
    );
  }
}
