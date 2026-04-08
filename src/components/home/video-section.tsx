"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

const YOUTUBE_ID = "MTERSVvQggI";

export function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="py-20 md:py-28 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-sans tracking-widest text-primary uppercase mb-6 text-center">
          Assista agora
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
          {/* Video / Thumbnail */}
          <div className="relative aspect-video rounded-sm overflow-hidden bg-muted">
            {playing ? (
              <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`}
                title="Isabella Mezzadri explica como planejar o casamento dos sonhos"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 w-full h-full group"
                aria-label="Reproduzir vídeo"
              >
                <Image
                  src={`https://img.youtube.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`}
                  alt="Isabella Mezzadri"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors duration-200" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/90 flex items-center justify-center group-hover:bg-primary transition-colors duration-200">
                    <Play className="w-7 h-7 md:w-8 md:h-8 text-white ml-1" />
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Text */}
          <div className="text-center md:text-left">
            <h2 className="font-display font-medium text-2xl md:text-3xl leading-tight tracking-editorial text-foreground">
              Isabella Mezzadri explica como planejar o casamento dos sonhos
            </h2>
            <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
              Descubra como transformar o seu sonho em realidade com planejamento 100% digital e curadoria especializada.
            </p>
            {!playing && (
              <button
                onClick={() => setPlaying(true)}
                className="mt-6 inline-flex items-center gap-2 min-h-11 px-6 py-3 rounded-sm bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-brand-wine transition-colors duration-200"
              >
                <Play className="w-4 h-4" />
                Assistir vídeo
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
