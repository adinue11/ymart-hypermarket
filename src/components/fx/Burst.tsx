const COLORS = ["#c8ff2e", "#ffd184", "#b1f5ef", "#e6b9ff", "#ffffff"];

/** Tiny CSS confetti burst — mount it when something succeeds. */
export default function Burst({ count = 26, className = "" }: { count?: number; className?: string }) {
  return (
    <span className={`burst ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          style={{
            ["--a" as string]: `${(i / count) * 360 + (i % 3) * 7}deg`,
            ["--d" as string]: `${55 + ((i * 37) % 70)}px`,
            ["--c" as string]: COLORS[i % COLORS.length],
            animationDelay: `${(i % 5) * 18}ms`,
          }}
        />
      ))}
    </span>
  );
}
