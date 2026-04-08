import { ScrollAwareNavbar } from "@/components/home/scroll-aware-navbar";
import { Hero } from "@/components/home/hero";
import { VideoSection } from "@/components/home/video-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { Destinations } from "@/components/home/destinations";
import { Numbers } from "@/components/home/numbers";
import { VenuesGrid } from "@/components/home/venues-grid";
import { Testimonials } from "@/components/home/testimonials";
import { WhereWeAre } from "@/components/home/where-we-are";
import { ContactConsultant } from "@/components/home/contact-consultant";
import { Faq } from "@/components/home/faq";
import { Footer } from "@/components/home/footer";

export default function Home() {
  return (
    <>
      <ScrollAwareNavbar />
      <main>
        <Hero />
        <VideoSection />
        <HowItWorks />
        <Destinations />
        <Numbers />
        <VenuesGrid />
        <Testimonials />
        <WhereWeAre />
        <ContactConsultant />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
