import Image from "next/image";
import Link from "next/link";
import { venues } from "@/data/venues";

const DESTINATIONS = venues.slice(0, 8).map((v) => ({
  slug: v.slug,
  name: v.name,
  city: v.city,
  cover: v.cover,
}));

export function Destinations() {
  return (
    <section id="destinos" className="py-20 md:py-28 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display font-medium text-2xl md:text-3xl lg:text-4xl text-center tracking-editorial leading-tight">
          Qual cenário inesquecível você gostaria de se casar?
        </h2>

        <div
          className="mt-10 md:mt-14 flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {DESTINATIONS.map((dest) => (
            <Link
              key={dest.slug}
              href={`/oferta/${dest.slug}`}
              className="flex-none w-64 md:w-72 snap-start group"
            >
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-muted">
                <Image
                  src={dest.cover}
                  alt={dest.name}
                  fill
                  sizes="(max-width: 768px) 260px, 290px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-display font-medium text-white text-lg leading-tight">
                    {dest.name}
                  </p>
                  <p className="text-white/80 text-xs mt-1">{dest.city}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
