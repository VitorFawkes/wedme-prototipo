"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Lightbox responsivo para galeria de fotos.
 *
 * Mobile: full-screen, swipe horizontal (Framer Motion drag)
 * Desktop: max-w-4xl centered, setas para navegar
 *
 * Fecha com ESC ou tap no overlay.
 */
export function Lightbox({
  images,
  open,
  initialIndex = 0,
  onClose,
  alt,
}: {
  images: readonly string[];
  open: boolean;
  initialIndex?: number;
  onClose: () => void;
  alt: string;
}) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation desktop
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center safe-px safe-top safe-bottom"
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de fotos"
          onClick={onClose}
        >
          {/* Botão fechar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Fechar galeria"
            className="absolute top-4 right-4 z-10 inline-flex items-center justify-center min-w-11 min-h-11 rounded-full bg-background/10 text-white hover:bg-background/20 transition-colors backdrop-blur-sm"
          >
            <X className="size-5" />
          </button>

          {/* Setas desktop */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Imagem anterior"
            className="hidden md:inline-flex absolute left-6 z-10 items-center justify-center min-w-12 min-h-12 rounded-full bg-background/10 text-white hover:bg-background/20 transition-colors backdrop-blur-sm"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Próxima imagem"
            className="hidden md:inline-flex absolute right-6 z-10 items-center justify-center min-w-12 min-h-12 rounded-full bg-background/10 text-white hover:bg-background/20 transition-colors backdrop-blur-sm"
          >
            <ChevronRight className="size-6" />
          </button>

          {/* Imagem com swipe gesture mobile */}
          <motion.div
            key={index}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, info) => {
              if (info.offset.x < -80) next();
              else if (info.offset.x > 80) prev();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center px-4 cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[index]}
              alt={`${alt}, foto ${index + 1} de ${images.length}`}
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-contain"
              priority
            />
          </motion.div>

          {/* Contador */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/10 text-white text-xs uppercase tracking-widest px-3 py-1.5 rounded-sm backdrop-blur-sm">
            {index + 1} / {images.length}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
