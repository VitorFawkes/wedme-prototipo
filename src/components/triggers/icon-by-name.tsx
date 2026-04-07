import {
  Sparkles,
  Gift,
  Users,
  Clock,
  ShieldCheck,
  Target,
  Eye,
  type LucideIcon,
} from "lucide-react";

/**
 * Lookup de ícones Lucide usados em gatilhos. Mantemos o mapeamento
 * estático pra evitar dynamic import e garantir bundle pequeno.
 */
const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Gift,
  Users,
  Clock,
  ShieldCheck,
  Target,
  Eye,
};

export function TriggerIcon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  if (!name) return null;
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} aria-hidden="true" />;
}
