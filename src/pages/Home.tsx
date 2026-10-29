import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Navigation, Footer } from "@/components/ymart/Chrome";
import { DestinationWorlds, ExploreIndex, Hero } from "@/components/ymart/ImmersiveSections";
import {
  AboutSection,
  ContactSection,
  CustomerExperienceSection,
  EventsSection,
  FAQSection,
  FeaturedSection,
  NewsletterSection,
  DeliverySection,
} from "@/components/ymart/BusinessSections";
import { CategoriesSection, PartnerSection, VisionTeamSection } from "@/components/ymart/CompanySections";
import { CredentialsSection } from "@/components/ymart/CredentialsSection";
import Marquee from "@/components/fx/Marquee";
import OfferPosterCarousel from "@/components/ymart/OfferPosterCarousel";

/* Heavy, below-the-fold pieces load on demand so first paint stays fast. */
const LocationsSection = lazy(() => import("@/components/ymart/LocationsSection"));
const TrolleyWalker = lazy(() => import("@/components/ymart/TrolleyWalker").then((m) => ({ default: m.TrolleyWalker })));

function LazyLocations() {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "700px 0px" });
  return (
    <div ref={ref} id={near ? undefined : "locations"} className={near ? undefined : "map-lazy"}>
      {near ? (
        <Suspense fallback={<div className="map-lazy" id="locations"><div className="map-skeleton" /></div>}>
          <LocationsSection />
        </Suspense>
      ) : (
        <div className="map-skeleton" />
      )}
    </div>
  );
}

export default function Home() {
  const [walker, setWalker] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => setWalker(true);
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 2500 });
    else setTimeout(go, 1800);
  }, []);

  return (
    <main className="ymart-site">
      <OfferPosterCarousel />
      <Navigation />
      <Hero />
      <FeaturedSection />
      <Marquee />
      <ExploreIndex />
      <DestinationWorlds />
      <AboutSection />
      <VisionTeamSection />
      <CategoriesSection />
      <Marquee reverse />
      <EventsSection />
      <CustomerExperienceSection />
      <DeliverySection />
      <LazyLocations />
      <PartnerSection />
      <ContactSection />
      <FAQSection />
      <NewsletterSection />
      <CredentialsSection />
      <Footer />
      {walker && (
        <Suspense fallback={null}>
          <TrolleyWalker />
        </Suspense>
      )}
    </main>
  );
}
