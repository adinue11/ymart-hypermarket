import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type Tag = "h1" | "h2" | "h3";
const M = { h1: motion.h1, h2: motion.h2, h3: motion.h3 } as const;

const EASE = [0.22, 1, 0.36, 1] as const;

function makeWord(chars: boolean): Variants {
  return {
    hidden: { y: "112%", rotate: chars ? 0 : 5, opacity: 0 },
    show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: chars ? 0.8 : 0.95, ease: EASE } },
  };
}

function split(node: ReactNode, chars: boolean, path = "k"): ReactNode {
  const wv = makeWord(chars);
  if (typeof node === "string") {
    return node.split(/(\s+)/).map((part, i) => {
      if (part === "") return null;
      if (/^\s+$/.test(part)) return " ";
      const key = `${path}-${i}`;
      return (
        <span className="aw" key={key}>
          {chars ? (
            Array.from(part).map((ch, ci) => (
              <motion.span className="aw__in" variants={wv} key={ci}>
                {ch}
              </motion.span>
            ))
          ) : (
            <motion.span className="aw__in" variants={wv}>
              {part}
            </motion.span>
          )}
        </span>
      );
    });
  }
  if (Array.isArray(node)) return node.map((n, i) => split(n, chars, `${path}${i}`));
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    if (el.type === "br") return el;
    // punctuation-only spans (the coloured full stop) stay glued to the previous word
    if (typeof el.props.children === "string" && /^[\s.,!?;:–—]+$/.test(el.props.children)) return cloneElement(el, { key: path });
    return cloneElement(el, { key: path }, Children.map(el.props.children, (c, i) => split(c, chars, `${path}${i}`)));
  }
  return node;
}

type Props = {
  as?: Tag;
  className?: string;
  children: ReactNode;
  chars?: boolean;
  delay?: number;
  /** when provided, controls the reveal instead of scroll-into-view (used by the hero) */
  when?: boolean;
  id?: string;
};

/** Masked word-by-word (or letter-by-letter) headline reveal. Keeps <em>, <br/> and spans intact. */
export function AH({ as = "h2", className, children, chars = false, delay = 0, when, id }: Props) {
  const reduced = useReducedMotion();
  const Comp = M[as];
  const parent: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: chars ? 0.028 : 0.06, delayChildren: delay } },
  };
  if (reduced) return <Comp id={id} className={className}>{children}</Comp>;
  const trigger =
    when === undefined
      ? { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.35 } }
      : { initial: "hidden", animate: when ? "show" : "hidden" };
  return (
    <Comp id={id} className={className} variants={parent} {...trigger}>
      {split(children, chars)}
    </Comp>
  );
}
