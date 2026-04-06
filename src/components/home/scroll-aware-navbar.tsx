"use client";

import { useEffect, useState } from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";

/**
 * Navbar que muda de transparente (sobre hero) para sólida (após scroll).
 * Usado só na home — outras páginas usam navbar sólida direto.
 */
export function ScrollAwareNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <PublicNavbar variant={scrolled ? "solid" : "transparent"} />;
}
