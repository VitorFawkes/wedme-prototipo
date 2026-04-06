import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { CoupleProvider } from "@/components/providers/couple-provider";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "we.wedme — Curadoria de casamentos",
  description:
    "Seu casamento dos sonhos, do início ao fim. A gente cuida dos profissionais. Vocês cuidam do sonho.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FEFAF3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${body.variable} antialiased`}
    >
      <body className="min-h-dvh bg-background text-foreground">
        <CoupleProvider>{children}</CoupleProvider>
      </body>
    </html>
  );
}
