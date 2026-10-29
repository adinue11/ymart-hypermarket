import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Images, LoaderCircle } from "lucide-react";
import { getNextUpcomingOutlet, getWeeklyOfferPosters, type WeeklyOfferPoster } from "@/lib/ymart-offers";

const outletNames: Record<string, string> = {
  naimarmoola: "Naimarmoola",
  "cherkala-new": "Cherkala New",
  nellikatta: "Nellikatta",
  cherkala: "Cherkala",
};

type OpenOfferDetail = { outletId?: string };

export function openOfferCarousel(outletId?: string) {
  window.dispatchEvent(new CustomEvent<OpenOfferDetail>("ymart:open-offers", { detail: { outletId } }));
}

export default function OfferPosterCarousel() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [outletId, setOutletId] = useState<string | undefined>();
  const [index, setIndex] = useState(0);
  const {
    data: posters = [],
    isLoading: loading,
    isError: error,
    refetch,
  } = useQuery<WeeklyOfferPoster[]>({
    queryKey: ["weekly-offer-posters", outletId ?? "all-outlets"],
    queryFn: () => getWeeklyOfferPosters(outletId),
    enabled: open,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<OpenOfferDetail>).detail;
      setOutletId(detail?.outletId);
      setIndex(0);
      setOpen(true);
    };
    window.addEventListener("ymart:open-offers", handleOpen);
    return () => window.removeEventListener("ymart:open-offers", handleOpen);
  }, []);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open, outletId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") setIndex((value) => posters.length ? (value + 1) % posters.length : 0);
      if (event.key === "ArrowLeft") setIndex((value) => posters.length ? (value - 1 + posters.length) % posters.length : 0);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, posters.length]);

  const current = posters[index];
  const title = useMemo(() => outletId ? `${outletNames[outletId] ?? outletId} offers` : "Offers across YMART", [outletId]);
  const change = (step: number) => setIndex((value) => posters.length ? (value + step + posters.length) % posters.length : 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="offer-carousel-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.section className="offer-carousel" role="dialog" aria-modal="true" aria-label={title} initial={reduced ? false : { opacity: 0, y: 35, rotateX: 8, scale: .94 }} animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, rotateX: -5, scale: .96 }} transition={{ duration: reduced ? .12 : .38, ease: [0.22, 1, .36, 1] }}>
            <div className="offer-carousel__top"><div><span className="offer-carousel__eyebrow"><Images size={13} /> YMART WEEKLY OFFERS</span><h2>{title}</h2></div><button className="offer-carousel__close" type="button" aria-label="Close offers" onClick={() => setOpen(false)}><X size={20} /></button></div>
            {loading ? <div className="offer-carousel__state"><LoaderCircle className="offer-carousel__spinner" size={28} /><p>Loading the latest offers…</p></div> : error ? <div className="offer-carousel__state"><p>Offers could not be loaded right now. Please try again shortly.</p><button type="button" onClick={() => { void refetch(); }}>Try again</button></div> : current ? (
              <div className="offer-carousel__stage" onTouchStart={(event) => { (event.currentTarget as HTMLDivElement).dataset.touchX = String(event.touches[0]?.clientX ?? 0); }} onTouchEnd={(event) => { const start = Number((event.currentTarget as HTMLDivElement).dataset.touchX ?? 0); const delta = (event.changedTouches[0]?.clientX ?? start) - start; if (Math.abs(delta) > 45) change(delta < 0 ? 1 : -1); }}>
                <div className="offer-carousel__halo" aria-hidden="true" />
                <AnimatePresence mode="wait">
                  <motion.figure key={current.id} className="offer-carousel__poster" initial={reduced ? false : { opacity: 0, rotateY: 14, x: 26, scale: .96 }} animate={{ opacity: 1, rotateY: 0, x: 0, scale: 1 }} exit={reduced ? { opacity: 0 } : { opacity: 0, rotateY: -12, x: -20, scale: .97 }} transition={{ duration: reduced ? .12 : .3 }}>
                    <img src={current.imageUrl} alt={current.title || "YMART weekly offer poster"} decoding="async" />
                    <figcaption>{current.title || "Weekly offers"}</figcaption>
                  </motion.figure>
                </AnimatePresence>
                {posters.length > 1 && <><button className="offer-carousel__arrow offer-carousel__arrow--prev" type="button" onClick={() => change(-1)} aria-label="Previous offer"><ChevronLeft /></button><button className="offer-carousel__arrow offer-carousel__arrow--next" type="button" onClick={() => change(1)} aria-label="Next offer"><ChevronRight /></button></>}
              </div>
            ) : <div className="offer-carousel__state"><span className="offer-carousel__empty-icon"><Images size={24} /></span><h3>{outletId ? `No active offer at ${outletNames[outletId] ?? outletId}` : `Upcoming offer at ${getNextUpcomingOutlet().name}`}</h3><p>Stay tuned. The next offer will appear here when it goes live.</p></div>}
            <div className="offer-carousel__bottom"><span>{posters.length ? `${index + 1} / ${posters.length} · Swipe or use arrows to explore` : "Fresh offers appear here when they go live"}</span>{posters.length > 1 && <div className="offer-carousel__dots">{posters.map((poster, i) => <button key={poster.id} type="button" className={i === index ? "is-active" : ""} aria-label={`Show offer ${i + 1}`} onClick={() => setIndex(i)} />)}</div>}</div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
