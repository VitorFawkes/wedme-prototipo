import Image from "next/image";
import Link from "next/link";
import { Star, Check } from "lucide-react";
import type { Vendor } from "@/types";
import { formatBRL } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

/**
 * Card editorial de profissional na listagem de categoria.
 *
 * Mobile: 1 col, imagem aspect-[4/3], padding generoso
 * Desktop: 2 cols, mesmo card mas com hover scale na imagem
 */
export function VendorCard({ vendor }: { vendor: Vendor }) {
  const minPrice = Math.min(...vendor.packages.map((p) => p.price));

  return (
    <Link
      href={`/oferta/${vendor.slug}`}
      className="group block bg-card border border-border rounded-md overflow-hidden transition-all duration-300 hover:shadow-lg active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={vendor.cover}
          alt={`${vendor.name}, ${vendor.tagline}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {vendor.verified && (
          <Badge
            variant="verified"
            className="absolute top-3 left-3"
          >
            <Check className="size-3" /> Verificado
          </Badge>
        )}
      </div>

      <div className="p-5 md:p-6">
        <h3 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-editorial leading-tight mb-2">
          {vendor.name}
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          <span>{vendor.city}, {vendor.state}</span>
          <span aria-hidden="true">·</span>
          <Star className="size-3.5 fill-foreground text-foreground" />
          <span className="font-medium text-foreground">{vendor.rating}</span>
          <span aria-hidden="true">·</span>
          <span>{vendor.total_reviews} casamentos</span>
        </p>
        <p className="font-display italic text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
          &ldquo;{vendor.social_proof_line}&rdquo;
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              A partir de
            </p>
            <p className="font-display text-xl md:text-2xl text-foreground tracking-editorial">
              {formatBRL(minPrice)}
            </p>
          </div>
          <span className="inline-flex items-center min-h-11 px-4 md:px-5 rounded-sm bg-primary text-primary-foreground text-sm font-medium tracking-wide group-hover:bg-brand-wine transition-colors">
            Ver perfil →
          </span>
        </div>
      </div>
    </Link>
  );
}
