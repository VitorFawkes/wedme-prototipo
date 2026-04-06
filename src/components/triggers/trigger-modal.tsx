"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/ornaments/ornament";
import { TriggerIcon } from "@/components/triggers/icon-by-name";
import type { EvaluatedTrigger } from "@/lib/evaluate-triggers";

/**
 * modal — usado por gatilhos muito importantes (ex: presente das 3 confirmações).
 *
 * Em mobile vira bottom sheet (vaul Drawer já é responsivo);
 * em desktop centraliza.
 */
export function TriggerModal({
  trigger,
  onDismiss,
}: {
  trigger: EvaluatedTrigger;
  onDismiss: () => void;
}) {
  const [open, setOpen] = useState(true);
  const { content } = trigger;

  // Quando o modal fecha (qualquer caminho), notifica o pai
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => onDismiss(), 200);
      return () => clearTimeout(t);
    }
  }, [open, onDismiss]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="bg-background">
        <div className="mx-auto w-full max-w-lg safe-bottom">
          <DrawerHeader className="text-center pt-8">
            <div className="flex justify-center mb-4">
              {content.icon ? (
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <TriggerIcon
                    name={content.icon}
                    className="size-7 text-primary"
                  />
                </div>
              ) : (
                <Ornament size="lg" />
              )}
            </div>
            <DrawerTitle className="font-display text-2xl md:text-4xl font-medium tracking-editorial leading-tight">
              {content.title}
            </DrawerTitle>
            <DrawerDescription className="text-base font-sans text-muted-foreground leading-relaxed mt-3 px-2">
              {content.body}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex flex-col gap-2 px-6 pb-8">
            {content.cta_text && (
              <Button
                size="lg"
                variant="primary"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                {content.cta_text}
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="ghost" size="md" className="w-full">
                Agora não
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
