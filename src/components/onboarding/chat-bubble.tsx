import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Bolha de conversa do chat de onboarding (briefing §5.2).
 *
 * - Assistente: esquerda, bg-muted, rounded-md rounded-bl-[2px]
 * - Casal: direita, bg-primary text-primary-foreground, rounded-md rounded-br-[2px]
 * - Largura: max-w-[85%] mobile, max-w-md desktop
 * - Animação: fade + slide-up sutil (400ms)
 * - aria-label por role
 */
export function ChatBubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  const isAssistant = role === "assistant";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex w-full",
        isAssistant ? "justify-start" : "justify-end",
      )}
    >
      <div
        role="article"
        aria-label={isAssistant ? "Mensagem da assistente" : "Sua mensagem"}
        className={cn(
          "max-w-[85%] md:max-w-md px-5 py-4 text-sm md:text-base font-sans leading-relaxed",
          isAssistant
            ? "bg-muted text-foreground rounded-md rounded-bl-[2px]"
            : "bg-primary text-primary-foreground rounded-md rounded-br-[2px]",
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
