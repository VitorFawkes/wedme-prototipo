"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CategoryFAQ } from "@/types";

type Props = {
  items: CategoryFAQ[];
};

export function FAQSection({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <h3 className="font-display font-medium text-lg tracking-editorial mb-4">
        Perguntas frequentes
      </h3>

      <div className="space-y-2">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="border border-border rounded-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left min-h-11"
              >
                <span className="text-sm font-medium text-foreground">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground flex-none transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
