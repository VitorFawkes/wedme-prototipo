import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = {
  title: "Protótipo — we.wedme",
  description: "Esta é uma página de protótipo da plataforma we.wedme.",
};

export default function PrototipoPage() {
  return (
    <main className="min-h-[100svh] flex flex-col items-center justify-center px-6 text-center">
      <Logo className="text-3xl mb-8" />

      <h1 className="font-display font-medium text-3xl md:text-4xl tracking-editorial leading-tight">
        Este é um protótipo
      </h1>

      <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
        Esta página demonstra o projeto em fase de desenvolvimento. As redes
        sociais e funcionalidades completas estarão disponíveis em breve.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center min-h-11 px-6 py-3 rounded-sm border border-primary text-primary text-sm font-medium tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
