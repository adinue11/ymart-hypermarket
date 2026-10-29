import { useEffect, useRef, useState, type ReactNode, type PointerEvent } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { destinations, hypermarkets, type Destination } from "@/lib/ymart-content";
import { MagneticLink } from "./Chrome";
import { AH } from "@/components/fx/Heading";
import CountUp from "@/components/fx/CountUp";
import { useReady } from "@/lib/ready";
import { getNextUpcomingOutlet, getWeeklyOfferPosters } from "@/lib/ymart-offers";
import { openOfferCarousel } from "./OfferPosterCarousel";
import { useLocation } from "wouter";
import { ArrowDown, ArrowUpRight, Search } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export const toneAccent: Record<string, string> = {
  opal: "#b1f5ef",
  solstice: "#ffd184",
  verdant: "#b5e733",
  prism: "#e6b9ff",
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      id={id}
      className={className}
      initial={reduced ? false : { opacity: 0, y: 44, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{
        duration: reduced ? 0 : 0.9,
        delay: reduced ? 0 : delay,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  );
}

const searchTexts = [
  "Search the item",
  "സാധനം തിരയുക",
  "பொருளைத் தேடுங்கள்",
  "आइटम खोजें",
  "ابحث عن العنصر",
  "Artikel suchen",
];

export function Hero() {
  const [, setLocation] = useLocation();
  const [searchLanguage, setSearchLanguage] = useState(0);

  const heroRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const ready = useReady();

  const [liveOffers, setLiveOffers] = useState<
    Awaited<ReturnType<typeof getWeeklyOfferPosters>>
  >([]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSearchLanguage((current) => (current + 1) % searchTexts.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const updateOffers = async () => {
      try {
        const posters = await getWeeklyOfferPosters();

        if (!cancelled) {
          setLiveOffers(posters);
        }
      } catch (error) {
        console.error("Failed to load homepage weekly offers:", error);

        if (!cancelled) {
          setLiveOffers([]);
        }
      }
    };

    void updateOffers();

    const interval = window.setInterval(() => {
      void updateOffers();
    }, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const drift = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const fade = useTransform(scrollYProgress, [0, 0.88, 1], [1, 0.86, 0.2]);

  const moveOrbit = (event: PointerEvent<HTMLElement>) => {
    if (reduced || event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();

    event.currentTarget.style.setProperty(
      "--cursor-x",
      `${(event.clientX / rect.width - 0.5) * 30}px`,
    );

    event.currentTarget.style.setProperty(
      "--cursor-y",
      `${(event.clientY / rect.height - 0.5) * 22}px`,
    );
  };

  const resetOrbit = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--cursor-x", "0px");
    event.currentTarget.style.setProperty("--cursor-y", "0px");
  };

  const up = (delay: number) =>
    ({
      initial: reduced ? false : { opacity: 0, y: 34 },
      animate: ready ? { opacity: 1, y: 0 } : undefined,
      transition: { duration: 1, delay, ease: EASE },
    }) as const;

  return (
    <section
      className="hero"
      id="home"
      data-nav-section
      ref={heroRef}
      onPointerMove={moveOrbit}
      onPointerLeave={resetOrbit}
    >
      <motion.img
        className="hero__image"
        src="/images/hero.svg"
        alt=""
        fetchPriority="high"
        draggable={false}
        initial={reduced ? false : { scale: 1.3 }}
        animate={ready ? { scale: 1 } : undefined}
        transition={{ duration: 2.4, ease: EASE }}
        style={reduced ? undefined : { y: drift, opacity: fade }}
      />

      <div className="hero__veil" aria-hidden="true" />

      {/* Floating multilingual product-search button */}
      <motion.button
        type="button"
        className="hero-search-button"
        onClick={() => setLocation("/store/hypermarket-1?focusSearch=1")}
        aria-label="Search items at Naimarmoola"
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
      >
        <Search size={18} aria-hidden="true" />

        <span key={searchLanguage} className="hero-search-button__text">
          {searchTexts[searchLanguage]}
        </span>

        <ArrowUpRight size={16} aria-hidden="true" />
      </motion.button>

      {/* Existing weekly-offer popup */}
      <motion.div
        className="hero-offer-popup"
        role="button"
        tabIndex={0}
        aria-label="Open YMART weekly offers"
        onClick={() => openOfferCarousel()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openOfferCarousel();
          }
        }}
        initial={
          reduced
            ? false
            : { opacity: 0, y: 71, rotateX: -12, scale: 0.88 }
        }
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <span className="hero-offer-popup__pulse" />

        <div className="hero-offer-popup__details">
          <span className="hero-offer-popup__label">
            {liveOffers.length > 0 ? "LIVE AT YMART" : "COMING UP AT YMART"}
          </span>

          <strong>
            {liveOffers.length > 0
              ? "Today's offer is here."
              : `Upcoming offer at ${getNextUpcomingOutlet().name}.`}
          </strong>

          <p>
            {liveOffers.length > 0
              ? `${liveOffers.length} active offer${liveOffers.length === 1 ? "" : "s"} · Tap to explore`
              : "Stay tuned. Tap to explore offers."}
          </p>
        </div>

        <span className="hero-offer-popup__hint" aria-hidden="true">
          ↗
        </span>
      </motion.div>

      <div className="hero__orbit hero__orbit--outer" aria-hidden="true" />
      <div className="hero__orbit hero__orbit--inner" aria-hidden="true" />

      <div className="hero__content">
        <motion.div className="hero__eyebrow" {...up(0.15)}>
          <span className="live-dot" /> THE HEALTHY, FRESHENED <span>·</span> IN
          YMART
        </motion.div>

        <AH as="h1" className="hero__title" chars when={ready} delay={0.25}>
          Everyday,
          <br />
          <em>elsewhere.</em>
        </AH>

        <motion.p className="hero__intro" {...up(0.7)}>
          Four destinations. One World. A whole new feeling around the familiar.
        </motion.p>

        <motion.div className="hero__actions" {...up(0.85)}>
          <MagneticLink href="#stores" variant="lime">
            Explore Stores
          </MagneticLink>
        </motion.div>
      </div>

      <motion.div
        className="hero__aside"
        aria-label="YMART at a glance"
        initial={reduced ? false : { opacity: 0, x: 40 }}
        animate={ready ? { opacity: 1, x: 0 } : undefined}
        transition={{ duration: 1, delay: 1.05, ease: EASE }}
      >
        <span className="hero__aside-kicker">
          A NEW WAY TO FIND YOUR EVERYDAY
        </span>

        <strong>
          <CountUp to={1} /> <span>Brand</span>
        </strong>

        <strong>
          <CountUp to={4} /> <span>destinations</span>
        </strong>

        <span className="hero__aside-line" />

        
      </motion.div>

      <motion.div
        className="hero__foot"
        initial={reduced ? false : { opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ duration: 1, delay: 1.4 }}
      >
        <span>
          <span className="hero__foot-dot" /> SCROLL TO EXPLORE
        </span>

        <span>
          00 / 04 <span className="hero__foot-line" />
        </span>

        <span>AN EXPERIENCE BY YMART</span>
      </motion.div>
    </section>
  );
}

function DestinationIndexCard({
  destination,
  index,
}: {
  destination: Destination;
  index: number;
}) {
  const reduced = useReducedMotion();
  const [, setLocation] = useLocation();

  return (
    <motion.a
      className={`index-card index-card--${destination.tone}`}
      href={`/store/${destination.id}`}
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        setLocation(`/store/${destination.id}`);
      }}
      initial={reduced ? false : { opacity: 0, y: 70, rotateX: 18 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.95, delay: index * 0.1, ease: EASE }}
    >
      <span className="index-card__top">
        <span>{destination.number} / 04</span>
        <ArrowUpRight size={15} aria-hidden="true" />
      </span>

      <span className="index-card__image-wrap">
        <img
          src={destination.image}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </span>

      <span className="index-card__bottom">
        <small>VISIT HYPERMARKET</small>
        <strong>{destination.name}</strong>
      </span>
    </motion.a>
  );
}

export function ExploreIndex() {
  return (
    <section className="explore-index section-light" id="explore">
      <div className="section-wrap">
        <div className="section-heading section-heading--dark">
          <Reveal>
            <p className="eyebrow eyebrow--dark">
              <span>THE WAYFINDER</span>
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="section-heading__line">
              <AH as="h2">
                Take a look
                <br />
                around<span className="accent-dot">.</span>
              </AH>

              <p>
                Step into the hypermarket and see where your shopping takes you.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="index-grid">
          {destinations.map((destination, index) => (
            <DestinationIndexCard
              destination={destination}
              index={index}
              key={destination.id}
            />
          ))}
        </div>

        <div className="index-foot">
          <span>ONE BRAND. NO COMPROMISE.</span>
          <span>
            Scroll to enter <ArrowDown size={14} />
          </span>
        </div>
      </div>
    </section>
  );
}

function SceneChapter({
  destination,
  isFirst = false,
}: {
  destination: Destination;
  isFirst?: boolean;
}) {
  const sceneRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start end", "end start"],
  });

  const depth = useTransform(scrollYProgress, [0, 1], [46, -46]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.06, 1.14]);

  const item = (delay: number) =>
    ({
      initial: reduced ? false : { opacity: 0, y: 28 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.2 },
      transition: {
        duration: reduced ? 0 : 0.8,
        delay: reduced ? 0 : delay,
        ease: EASE,
      },
    }) as const;

  return (
    <section
      className={`scene scene--${destination.tone}`}
      id={destination.id}
      data-nav-section
      ref={sceneRef}
      aria-label={`${destination.name} — ${destination.title}`}
    >
      <motion.img
        className="scene__image"
        src={destination.image}
        alt=""
        loading={isFirst ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        style={reduced ? undefined : { y: depth, scale }}
      />

      <div className="scene__overlay" aria-hidden="true" />
      <div className="scene__wire scene__wire--one" aria-hidden="true" />
      <div className="scene__wire scene__wire--two" aria-hidden="true" />

      <div className="scene__content">
        <motion.div className="scene__eyebrow" {...item(0)}>
          <span className="scene__orb" />
          {destination.eyebrow}
        </motion.div>

        <motion.p className="scene__world-label" {...item(0.1)}>
          WORLD {destination.number} <span>·</span>{" "}
          {destination.destinationLabel.toUpperCase()}
        </motion.p>

        <AH as="h3" delay={0.1}>
          {destination.title}
          <span>.</span>
        </AH>

        <motion.p className="scene__description" {...item(0.35)}>
          {destination.descriptor}
        </motion.p>

        <motion.div {...item(0.5)}>
          <MagneticLink
            href={`/store/${destination.id}`}
            variant="glass"
            className="scene__action"
          >
            Enter {destination.name}
          </MagneticLink>
        </motion.div>
      </div>
    </section>
  );
}

function WorldBreak({ title }: { title: string }) {
  return (
    <div
      className="world-break"
      aria-label={`${title} — a separate destination world`}
    >
      <motion.div
        className="world-break__rule"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE }}
        style={{ originX: 1 }}
      />

      <p>{title}</p>

      <motion.div
        className="world-break__rule"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE }}
        style={{ originX: 0 }}
      />
    </div>
  );
}

export function DestinationWorlds() {
  return (
    <section className="worlds" aria-label="The Four YMART destination worlds">
      <div
        className="worlds__chapter-label section-light"
        id="stores"
        data-nav-section
      >
        <div className="section-wrap worlds__intro">
          <Reveal>
            <p className="eyebrow eyebrow--dark">
              <span>01 — HYPERMARKETS</span>
              <span>FOUR INDIVIDUAL DESTINATIONS</span>
            </p>
          </Reveal>

          <AH as="h2">
            More than one way
            <br />
            to <em>do the everyday.</em>
          </AH>

          <Reveal delay={0.1}>
            <p className="worlds__intro-note">
              Stores seems different, but items are same. Find your own rhythm.
            </p>
          </Reveal>
        </div>
      </div>

      {hypermarkets.map((destination, index) => (
        <SceneChapter
          destination={destination}
          isFirst={index === 0}
          key={destination.id}
        />
      ))}

      <WorldBreak title="BECOMES ENDLESS" />
    </section>
  );
}
