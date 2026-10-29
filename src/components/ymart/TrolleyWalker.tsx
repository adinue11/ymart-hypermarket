import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 32;
/** Scroll distance (px) that advances the walk cycle by one frame. */
const PX_PER_FRAME = 14;
const IDLE_MS = 220;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Scroll-driven walker. No React state per scroll tick: one rAF loop reads
 * scrollY directly (iOS Safari throttles / coalesces scroll events during
 * momentum scrolling, so we do not rely on them to keep the loop alive).
 */
export function TrolleyWalker() {
  const [spriteFailed, setSpriteFailed] = useState(false);
  const walkerRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const walker = walkerRef.current;
    const sprite = spriteRef.current;
    if (!walker) return;

    const reducedMq = window.matchMedia(REDUCED_MOTION_QUERY);
    let raf = 0;
    let running = false;
    let lastY = window.scrollY;
    let lastMoveAt = 0;
    let walked = 0; // accumulated scroll distance
    let walkerWidth = 0;
    let viewW = 0;
    let maxScroll = 1;

    const measure = () => {
      walkerWidth = walker.offsetWidth;
      viewW = document.documentElement.clientWidth || window.innerWidth;
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    const place = () => {
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const startX = -(walkerWidth + 16);
      const endX = viewW + 16;
      const x = startX + (endX - startX) * progress;
      walker.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      walker.style.webkitTransform = walker.style.transform;
    };

    const tick = (now: number) => {
      const y = window.scrollY;
      const dy = y - lastY;
      if (dy !== 0) {
        lastY = y;
        lastMoveAt = now;
        walked += Math.abs(dy);
        walker.dataset.direction = dy < 0 ? "up" : "down";
        walker.dataset.scrolling = "true";
        place();
        if (sprite) {
          const frame = Math.floor(walked / PX_PER_FRAME) % FRAME_COUNT;
          sprite.style.transform = `translate3d(${(-frame * 100) / FRAME_COUNT}%,0,0)`;
        }
      } else if (now - lastMoveAt > IDLE_MS) {
        walker.dataset.scrolling = "false";
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (reducedMq.matches) return;
      lastMoveAt = performance.now();
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      measure();
      place();
    };

    measure();
    if (!reducedMq.matches) place();
    // Content height changes as lazy sections load; re-measure shortly after mount.
    const remeasure = window.setTimeout(onResize, 1200);

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("touchmove", wake, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("load", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(remeasure);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("touchmove", wake);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("load", onResize);
    };
  }, [spriteFailed]);

  return (
    <div
      ref={walkerRef}
      className="trolley-walker"
      data-scrolling="false"
      data-direction="down"
      data-sprite-failed={spriteFailed}
      aria-hidden="true"
    >
      <div className="trolley-walker__visual">
        <img
          ref={spriteRef}
          className="trolley-walker__sprite"
          src="/ymart-walker-sprite.webp"
          width={6144}
          height={176}
          alt=""
          loading="eager"
          draggable={false}
          onError={() => setSpriteFailed(true)}
        />
        <img
          className="trolley-walker__poster"
          src="/ymart-walker-poster.webp"
          width={384}
          height={352}
          alt=""
          loading="eager"
          draggable={false}
        />
      </div>
    </div>
  );
}
