import { Sparkles } from "lucide-react";

const words = ["FRESH PRODUCE", "DAILY ESSENTIALS", "FRESH CHICKEN", "KITCHEN & HOME", "WEEKLY OFFERS", "FOUR DESTINATIONS", "ONE YMART"];

export default function Marquee({ reverse = false }: { reverse?: boolean }) {
  const row = [...words, ...words];
  return (
    <div className={`marquee${reverse ? " marquee--rev" : ""}`} aria-hidden="true">
      <div className="marquee__track">
        {[0, 1].map((k) => (
          <div className="marquee__row" key={k}>
            {row.map((w, i) => (
              <span key={`${k}-${i}`}>
                {w}
                <Sparkles size={13} strokeWidth={1.4} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
