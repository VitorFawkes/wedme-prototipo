"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Info, Route, CreditCard } from "lucide-react";

const TABS = [
  {
    label: "Informações",
    href: "/meu-casamento",
    icon: Info,
    match: (path: string) => path.startsWith("/meu-casamento"),
  },
  {
    label: "Itinerário",
    href: "/planejamento",
    icon: Route,
    match: (path: string) => path.startsWith("/planejamento"),
  },
  {
    label: "Pagamento",
    href: "/checkout",
    icon: CreditCard,
    match: (path: string) => path.startsWith("/checkout"),
  },
] as const;

export function BottomTabNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border safe-bottom safe-px">
      <div className="flex">
        {TABS.map((tab) => {
          const isActive = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-14 py-2 text-xs font-medium tracking-wide transition-colors duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
