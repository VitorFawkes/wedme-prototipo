"use client";

import type { ColorPalette } from "@/types";
import { useCouple } from "@/store/couple";
import { Check } from "lucide-react";

type Props = {
  palettes: ColorPalette[];
};

export function ColorPaletteSelector({ palettes }: Props) {
  const selected = useCouple((s) => s.wedding_color_palette);
  const setColorPalette = useCouple((s) => s.setColorPalette);

  return (
    <div>
      <h3 className="font-display font-medium text-lg tracking-editorial mb-2">
        Paleta de cores
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Escolha a paleta que define o visual do seu casamento
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {palettes.map((palette) => {
          const isSelected = selected === palette.id;
          return (
            <button
              key={palette.id}
              onClick={() =>
                setColorPalette(isSelected ? null : palette.id)
              }
              className={`relative p-4 rounded-sm border transition-all duration-200 text-left ${
                isSelected
                  ? "border-primary ring-1 ring-primary/30 bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <p className="text-sm font-medium text-foreground mb-3">
                {palette.name}
              </p>
              <div className="flex gap-1.5">
                {palette.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border border-border/50"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
