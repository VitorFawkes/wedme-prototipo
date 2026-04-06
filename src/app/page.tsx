import { ScrollAwareNavbar } from "@/components/home/scroll-aware-navbar";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Numbers } from "@/components/home/numbers";
import { VenuesGrid } from "@/components/home/venues-grid";
import { Testimonials } from "@/components/home/testimonials";
import { Faq } from "@/components/home/faq";
import { Footer } from "@/components/home/footer";

export default function Home() {
  return (
    <>
      <ScrollAwareNavbar />
      <main>
        <Hero />
        <HowItWorks />
        <Numbers />
        <VenuesGrid />
        <Testimonials />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
