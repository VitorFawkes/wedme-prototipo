import { Plus, Minus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Overline } from "@/components/ornaments/overline";
import { homeFaq } from "@/data/home";

/**
 * FAQ da home (briefing §5.1 #6).
 *
 * Mobile: full-width, padding ajustado. Desktop: max-w-3xl.
 */
export function Faq() {
  return (
    <section
      id="faq"
      className="bg-background py-20 md:py-24 px-6 md:px-12 scroll-mt-20"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <Overline className="mb-4">Dúvidas frequentes</Overline>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-normal text-foreground tracking-editorial leading-tight">
            Perguntas frequentes
          </h2>
        </div>

        <Accordion className="border-t border-border">
          {homeFaq.map((item, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className="border-b border-border"
            >
              <AccordionTrigger className="!py-5 md:!py-6 !min-h-12 text-left font-display text-base md:text-lg font-medium text-foreground hover:!no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 md:pb-6 text-sm md:text-base text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
