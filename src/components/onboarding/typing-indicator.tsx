import { motion } from "framer-motion";

/**
 * Typing indicator — 3 pontinhos animados dentro de bolha muted.
 *
 * Usado antes de cada resposta da IA. Duração mínima 900ms (sincronizada
 * pela página, não pelo componente).
 */
export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start"
      aria-label="A assistente está digitando"
      role="status"
    >
      <div className="bg-muted text-foreground rounded-md rounded-bl-[2px] px-5 py-4 flex items-center gap-1.5">
        <Dot delay="0ms" />
        <Dot delay="200ms" />
        <Dot delay="400ms" />
      </div>
    </motion.div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="block size-2 rounded-full bg-muted-foreground animate-typing-dot"
      style={{ animationDelay: delay }}
      aria-hidden="true"
    />
  );
}
