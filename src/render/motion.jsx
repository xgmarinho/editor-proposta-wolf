import React, { useEffect, useRef, useContext, createContext } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";

// Quando true, números (CountUp) mostram o valor final direto, sem animar.
// Usado no PREVIEW do editor: lá a proposta renderiza dentro de um iframe via
// portal e o IntersectionObserver do useInView (que roda na janela-pai) nunca
// marca inView -> o count-up ficaria travado em 0. No export/publicado não há
// iframe, então o default (false) mantém a animação no scroll real.
const StaticNumbersContext = createContext(false);

// --- Motion system -----------------------------------------------------------
// Sequential, Framer-like choreography. Every section reveals its blocks in
// order; stacks "build up" card by card; reduced-motion collapses to static.
const EASE = [0.16, 1, 0.3, 1];

function useMotionEnabled() {
  return !useReducedMotion();
}

// Block that fades + lifts into place. Fires when the block is actually on
// screen (amount + bottom margin), so the viewer always sees it play.
function Reveal({ children, index = 0, y = 18, className = "", amount = 0.45, ...rest }) {
  const enabled = useMotionEnabled();
  return (
    <motion.div
      className={className}
      initial={enabled ? { opacity: 0, y } : false}
      whileInView={enabled ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.0, ease: EASE, delay: index * 0.18 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// Highlighted metric that rolls up from zero when it scrolls into view (count-up
// "slider"). Gives the proposal's key numbers a dynamic, building feel without
// touching their typography. Reduced-motion shows the final value instantly.
const fmtInt = (v) => String(Math.round(v));
const fmtPad2 = (v) => String(Math.round(v)).padStart(2, "0");
const fmtThousands = (v) => Math.round(v).toLocaleString("pt-BR");

function CountUp({ to, format = fmtInt, duration = 1.5, delay = 0.15 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const isStatic = useContext(StaticNumbersContext);
  const inView = useInView(ref, { once: true, amount: 0.6, margin: "0px 0px -8% 0px" });
  useEffect(() => {
    const node = ref.current;
    if (!node || reduce || isStatic || !inView) return undefined;
    const controls = animate(0, to, {
      duration,
      delay,
      ease: EASE,
      onUpdate: (v) => {
        node.textContent = format(v);
      },
    });
    return () => controls.stop();
  }, [inView, to, reduce, isStatic, duration, delay, format]);
  return <span ref={ref}>{format(reduce || isStatic ? to : 0)}</span>;
}

// Sequential list: the container is present from the start; its children enter
// one-by-one (staggerChildren) as the block scrolls into view, instead of the
// whole panel fading in as a single block. Children opt in with variants={listItem}.
const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.08 } },
};
const listItem = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
};

function StaggerList({ className, children, amount = 0.25 }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={listContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount, margin: "0px 0px -8% 0px" }}
    >
      {children}
    </motion.div>
  );
}

// Split heading segments ({ text, strong }) into individual words, keeping the
// emphasis flag so coloured/bold words survive the per-word reveal.
function toWords(segments) {
  const words = [];
  segments.forEach((seg) => {
    seg.text.split(/\s+/).forEach((tok) => {
      if (tok) words.push({ word: tok, strong: !!seg.strong });
    });
  });
  return words;
}

// Word-by-word headline reveal. Timed (independent of scroll): once it enters
// view it plays at its own pace. `from="up"` slides each word up from below
// (used for h1); `from="left"` reveals words left-to-right (used for h2).
const wordVariants = {
  up: {
    hidden: { opacity: 0, y: "0.7em" },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
  },
  left: {
    hidden: { opacity: 0, x: -12 },
    show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE } },
  },
};

function WordReveal({ segments, className = "", from = "left", trigger = "inView", stagger = 0.12, delayChildren = 0 }) {
  const enabled = useMotionEnabled();
  const words = toWords(segments);
  const label = words.map((w) => w.word).join(" ");
  const container = { hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren } } };
  const triggerProps =
    trigger === "mount"
      ? { animate: "show" }
      : { whileInView: "show", viewport: { once: true, amount: 0.5, margin: "0px 0px -8% 0px" } };

  if (!enabled) {
    return <span className={className} aria-label={label}>{label}</span>;
  }
  return (
    <motion.span className={className} aria-label={label} variants={container} initial="hidden" {...triggerProps}>
      {words.map((w, i) => (
        <motion.span key={i} className={w.strong ? "word word-strong" : "word"} variants={wordVariants[from]} aria-hidden="true">
          {w.word}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Sequential card list. Cards stack one below the other in normal flow; each one
// reveals (lift + fade) in order as it enters view — independent of scroll speed,
// so the viewer always sees the entrance play. Content is always fully readable.
function StackList({ items, cardClass, renderCard }) {
  return (
    <div className="stack-list">
      {items.map((item, i) => (
        <Reveal index={i} amount={0.3} className={cardClass} key={i}>
          {renderCard(item, i)}
        </Reveal>
      ))}
    </div>
  );
}

// Roadmap timeline. The spine is SCROLL-LINKED: it draws exactly as far as the
// viewer has scrolled through the section (a reading-progress line). The steps
// themselves are timed reveals — each plays its own fluid animation once it is
// well in view, so a fast scroll never skips a step.
function Timeline({ steps }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.5"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const stepVariant = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } } };
  return (
    <div className="timeline" ref={ref}>
      <span className="timeline-line">
        <motion.span style={{ scaleY: reduce ? 1 : scaleY }} />
      </span>
      {steps.map(([num, title, body]) => (
        <motion.div
          className="timeline-item"
          key={title}
          initial={reduce ? false : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, amount: 0.7, margin: "0px 0px -8% 0px" }}
          variants={reduce ? undefined : stepVariant}
        >
          <span className="timeline-num">{num}</span>
          <div>
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export { EASE, listItem, useMotionEnabled, Reveal, CountUp, StaticNumbersContext, fmtInt, fmtPad2, fmtThousands, StaggerList, WordReveal, StackList, Timeline };
