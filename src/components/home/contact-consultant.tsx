import Image from "next/image";
import { Phone, MessageCircle } from "lucide-react";

export function ContactConsultant() {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 bg-accent/50">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-center">
          {/* Photo */}
          <div className="flex justify-center md:justify-start">
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-muted ring-4 ring-primary/20">
              <Image
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80"
                alt="Consultora de casamentos"
                fill
                sizes="150px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Text */}
          <div className="text-center md:text-left">
            <h2 className="font-display font-medium text-2xl md:text-3xl tracking-editorial leading-tight">
              Dúvidas? Entre em contato
            </h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
              Nossa consultora está pronta para ajudar você a planejar cada detalhe do seu casamento.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <a
                href="tel:+554199876543"
                className="inline-flex items-center justify-center gap-2 min-h-11 px-6 py-3 rounded-sm bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:bg-brand-wine transition-colors duration-200"
              >
                <Phone className="w-4 h-4" />
                (41) 99876-5432
              </a>
              <a
                href="https://wa.me/554199876543"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-11 px-6 py-3 rounded-sm border border-primary bg-transparent text-primary text-sm font-medium tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
