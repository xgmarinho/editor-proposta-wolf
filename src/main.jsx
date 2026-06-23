import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  ArrowUpRight,
  BoundingBox,
  Buildings,
  CalendarBlank,
  CaretDown,
  Check,
  Cursor,
  EnvelopeSimple,
  FolderSimple,
  InstagramLogo,
  LinkedinLogo,
  Notepad,
  PenNib,
  PencilSimpleLine,
  Square,
  SquaresFour,
  TiktokLogo,
  UsersThree,
  VideoCamera,
  WarningCircle,
  XLogo,
} from "@phosphor-icons/react";
import "./styles.css";

import isotipo from "./assets/Isotipo.svg";
import foto1 from "./assets/fotos/1.png";
import foto2 from "./assets/fotos/2.png";
import foto3 from "./assets/fotos/3.png";
import foto4 from "./assets/fotos/4.png";
import logo1 from "./assets/marquee/1.svg";
import logo2 from "./assets/marquee/Logo.svg";
import logo3 from "./assets/marquee/Logotipos.svg";
import logo4 from "./assets/marquee/Union.svg";
import logo5 from "./assets/marquee/Vector.svg";
import logo6 from "./assets/marquee/Vector-1.svg";
import logo7 from "./assets/marquee/Vector-2.svg";
import logo8 from "./assets/marquee/Vector-3.svg";
import logo9 from "./assets/marquee/Vector-4.svg";
import logo10 from "./assets/marquee/Vector-5.svg";

// --- Motion system -----------------------------------------------------------
// Sequential, Framer-like choreography. Every section reveals its blocks in
// order; stacks "build up" card by card; reduced-motion collapses to static.
const EASE = [0.16, 1, 0.3, 1];
const avatars = [foto1, foto2, foto3, foto4];
const marqueeLogos = [logo1, logo2, logo3, logo4, logo5, logo6, logo7, logo8, logo9, logo10];

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
  const inView = useInView(ref, { once: true, amount: 0.6, margin: "0px 0px -8% 0px" });
  useEffect(() => {
    const node = ref.current;
    if (!node || reduce || !inView) return undefined;
    const controls = animate(0, to, {
      duration,
      delay,
      ease: EASE,
      onUpdate: (v) => {
        node.textContent = format(v);
      },
    });
    return () => controls.stop();
  }, [inView, to, reduce, duration, delay, format]);
  return <span ref={ref}>{format(reduce ? to : 0)}</span>;
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

function Brand({ className = "" }) {
  return (
    <div className={`brand ${className}`}>
      <img src={isotipo} alt="" />
      <span>Agencia Wolf®</span>
    </div>
  );
}

function SectionPill({ number, label }) {
  return (
    <div className="section-pill">
      <span>{number}</span>
      <b>{label}</b>
      <i />
    </div>
  );
}

function Hero() {
  const enabled = useMotionEnabled();
  return (
    <section className="hero">
      <motion.div
        className="hero-brand"
        initial={enabled ? { opacity: 0, y: -8 } : false}
        animate={enabled ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <Brand />
      </motion.div>
      <h1>
        <WordReveal
          from="up"
          trigger="mount"
          stagger={0.12}
          segments={[{ text: "Conteúdo e performance para sua " }, { text: "marca.", strong: true }]}
        />
      </h1>
      <motion.div
        className="hero-proof"
        initial={enabled ? { opacity: 0, y: 12 } : false}
        animate={enabled ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, ease: EASE, delay: 0.9 }}
      >
        <div className="avatars">
          {avatars.map((avatar, index) => (
            <motion.img
              src={avatar}
              alt=""
              key={index}
              initial={enabled ? { opacity: 0, x: -10 } : false}
              animate={enabled ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.5, ease: EASE, delay: 1 + index * 0.07 }}
            />
          ))}
        </div>
        <p>Os maiores do mercado escolheram a Wolf®</p>
      </motion.div>
    </section>
  );
}

function Marquee() {
  const enabled = useMotionEnabled();
  const items = [...marqueeLogos, ...marqueeLogos, ...marqueeLogos];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {items.map((logo, index) => (
          <motion.div
            className="marquee-logo"
            key={`${logo}-${index}`}
            initial={enabled ? { opacity: 0, y: 8 } : false}
            whileInView={enabled ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.55, ease: EASE, delay: (index % marqueeLogos.length) * 0.09 }}
          >
            <img src={logo} alt="" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Overview() {
  const items = [
    {
      title: "Consistência",
      body: "Produção recorrente e planejamento editorial para manter a marca presente, sem ruídos e sem pausas.",
    },
    {
      title: "Posicionamento",
      body: "Comunicação profissional que constrói autoridade e diferencia a marca no segmento.",
    },
    {
      title: "Oportunidades",
      body: "Presença digital transformada em audiência qualificada e novas conversas de negócio.",
    },
  ];

  return (
    <section className="section overview">
      <Reveal className="centered">
        <SectionPill number="01" label="Visão geral" />
      </Reveal>
      <h2>
        <WordReveal
          segments={[
            { text: "Uma operação pensada para manter a " },
            { text: "Design Elements", strong: true },
            { text: " ativa, relevante e bem posicionada." },
          ]}
        />
      </h2>
      <StackList
        items={items}
        cardClass="stack-card"
        renderCard={(item) => (
          <>
            <div className="stack-card-copy">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
            <ArrowUpRight weight="light" />
          </>
        )}
      />
    </section>
  );
}

function Scope() {
  const channels = [
    {
      title: "Instagram & Facebook",
      icon: InstagramLogo,
      lines: [
        ["24", "feed e reels"],
        ["60", "stories / Estáticos ou não"],
      ],
    },
    { title: "Tiktok", icon: TiktokLogo, lines: [["16", "vídeos"], ["", "edição e animação simples"]] },
    { title: "X / Twitter", icon: XLogo, lines: [["40", "publicações"], ["", "copy e estáticos"]] },
    { title: "Linkedin", icon: LinkedinLogo, lines: [["12", "publicações"], ["", "institucional"]] },
  ];

  return (
    <section className="section scope">
      <Reveal className="centered">
        <SectionPill number="02" label="Escopo" />
      </Reveal>
      <h2>
        <WordReveal segments={[{ text: "Produção adaptada para cada canal da marca." }]} />
      </h2>
      <Reveal index={1}>
        <p className="section-copy">
          Produção mensal para Instagram, Facebook, TikTok, X e LinkedIn, com adaptação de linguagem e formato para cada canal.
        </p>
      </Reveal>
      <Reveal index={2} className="metric-row">
        <strong>+<CountUp to={152} /></strong>
        <span>Entregas por mês, distribuídas entre os canais da marca.</span>
      </Reveal>
      <div className="channel-list">
        {channels.map((channel, index) => {
          const Icon = channel.icon;
          return (
            <Reveal index={index} amount={0.25} className="channel-card" key={channel.title}>
              <Icon className="channel-icon" weight="light" />
              <h3>{channel.title}</h3>
              <div className="channel-lines">
                {channel.lines.map(([qty, label]) => (
                  <p key={label}>
                    {qty && <strong><CountUp to={Number(qty)} /></strong>}
                    <span>{label}</span>
                  </p>
                ))}
              </div>
              <i className="red-glow" />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Materials() {
  const materials = [
    [FolderSimple, "Folders e banners"],
    [EnvelopeSimple, "E-mail marketing"],
    [SquaresFour, "Landing pages"],
    [Buildings, "Institucionais"],
  ];

  return (
    <section className="materials">
      <Reveal className="tool-pill-wrap">
        <div className="tool-pill">
          <span className="tool tool-active">
            <Cursor weight="fill" />
            <CaretDown weight="bold" />
          </span>
          <span className="tool">
            <BoundingBox weight="regular" />
            <CaretDown weight="bold" />
          </span>
          <span className="tool">
            <Square weight="regular" />
            <CaretDown weight="bold" />
          </span>
          <span className="tool">
            <PenNib weight="regular" />
            <CaretDown weight="bold" />
          </span>
        </div>
      </Reveal>
      <h2>
        <WordReveal segments={[{ text: "Criação dedicada para " }, { text: "cada campanha.", strong: true }]} />
      </h2>
      <Reveal index={1}>
        <p>Além do conteúdo recorrente, a operação contempla peças sob medida para ações e lançamentos da marca.</p>
      </Reveal>
      <Reveal index={2} className="light-divider" />
      <Reveal index={3} className="materials-metric">
        <strong>até <CountUp to={4} /></strong>
        <span>peças mensais de campanha</span>
        <Notepad weight="light" className="metric-icon" />
      </Reveal>
      <div className="material-grid">
        {materials.map(([Icon, label], index) => (
          <Reveal index={index} amount={0.4} className="material-button" key={label}>
            <Icon weight="regular" />
            <span>{label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// Vertical sequential list of strategy cards (one below the other). Replaces the
// old nested horizontal scroll, which felt detached. Each card reveals in order.
function StrategyList({ cards }) {
  return (
    <div className="strategy-list">
      {cards.map(([Icon, title, body], index) => (
        <Reveal index={index} amount={0.3} className="mini-card" key={title}>
          <Icon weight="light" />
          <h3>{title}</h3>
          <p>{body}</p>
        </Reveal>
      ))}
    </div>
  );
}

function Strategy() {
  const cards = [
    [CalendarBlank, "Planejamento editorial", "Calendário mensal, organização de pautas e direcionamento de conteúdo."],
    [UsersThree, "Reunião de alinhamento", "Encontro mensal para revisar direção, prioridades e próximos passos."],
    [ArrowUpRight, "Relatório de performance", "Leitura de resultados e ajustes estratégicos com base nos dados de cada ciclo."],
  ];
  const steps = [
    ["01", "Planejamento", "Calendário editorial do mês estruturado e aprovado."],
    ["02", "Aprovação", "Conteúdos e peças validados pelo cliente."],
    ["03", "Produção", "Criação e edição conduzidas pelo time da Wolf."],
    ["04", "Entrega", "Publicação e entrega dos materiais no cronograma."],
    ["✓", "Performance", "Relatório de resultados e reunião de alinhamento."],
  ];

  return (
    <section className="section strategy">
      <Reveal className="centered">
        <SectionPill number="04" label="Estratégia & gestão" />
      </Reveal>
      <h2>
        <WordReveal
          segments={[
            { text: "A operação não se limita à produção. Cada ciclo é " },
            { text: "lido e ajustado.", strong: true },
          ]}
        />
      </h2>
      <StrategyList cards={cards} />
      <h2 className="cycle-title">
        <WordReveal segments={[{ text: "Um ciclo mensal " }, { text: "previsível.", strong: true }]} />
      </h2>
      <Timeline steps={steps} />
    </section>
  );
}

function StartSection() {
  const checklist = [
    "Aprovação da proposta",
    "Alinhamento de objetivos",
    "Referências, materiais e acessos",
    "Linha editorial do primeiro ciclo",
    "Relatório de performance",
    "Time dedicado de 6 profissionais",
  ];
  const needs = [
    "Informações sobre a marca, produtos, serviços e diferenciais",
    "Materiais e referências visuais existentes",
    "Identidade visual da marca",
    "Acessos necessários às redes sociais e ferramentas",
    "Informações sobre campanhas, datas e ações relevantes",
    "Feedbacks e aprovações dentro dos prazos alinhados",
  ];

  return (
    <section className="section start">
      <Reveal className="centered">
        <SectionPill number="06" label="Início" />
      </Reveal>
      <h2>
        <WordReveal segments={[{ text: "O início da operação" }]} />
      </h2>
      <Reveal index={1}>
        <p className="section-copy">O calendário editorial será estruturado no início de cada mês, orientando a produção e as entregas do período.</p>
      </Reveal>
      <StaggerList className="check-panel">
        {checklist.map((item) => (
          <motion.p key={item} variants={listItem}>
            <Check weight="regular" />
            <span>{item}</span>
          </motion.p>
        ))}
      </StaggerList>
      <StaggerList className="needs-panel">
        <motion.h3 variants={listItem}>O que precisamos de você pra começar</motion.h3>
        {needs.map((item, index) => (
          <motion.p key={item} variants={listItem}>
            <small>{String(index + 1).padStart(2, "0")}</small>
            <span>{item}</span>
          </motion.p>
        ))}
        <motion.div className="warning-card" variants={listItem}>
          <SectionPill number={<WarningCircle weight="light" />} label="ATENÇÃO AQUI" />
          <p>A agilidade das entregas depende diretamente do envio correto das informações e da aprovação dos materiais dentro do ciclo de produção.</p>
        </motion.div>
      </StaggerList>
    </section>
  );
}

function Team() {
  const people = [
    [PencilSimpleLine, "×1", "Copywriter", "Estratégia de mensagem e direção de texto."],
    [SquaresFour, "×1", "Criadora\nde Conteúdo", "Captação e produção de conteúdo para a marca."],
    [PencilSimpleLine, "×3", "Designers", "Criação visual e peças gráficas."],
    [VideoCamera, "×1", "Editor de vídeo", "Edição de vídeos e animações simples."],
  ];

  return (
    <section className="team">
      <Reveal className="centered">
        <SectionPill number="08" label="Equipe" />
      </Reveal>
      <h2>
        <WordReveal segments={[{ text: "Um time dedicado ao projeto" }]} />
      </h2>
      <Reveal index={2} className="team-metric">
        <strong><CountUp to={6} format={fmtPad2} /></strong>
        <span>profissionais na operação</span>
        <UsersThree weight="light" />
      </Reveal>
      <StackList
        items={people}
        cardClass="team-card"
        renderCard={([Icon, qty, role, body]) => (
          <>
            <small>
              <i /> {qty}
            </small>
            <h3>
              {role.split("\n").map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </h3>
            <p>{body}</p>
            <Icon weight="light" className="team-card-icon" />
            <i className="card-handle" />
          </>
        )}
      />
    </section>
  );
}

function Proposal() {
  const included = [
    "Produção de conteúdo multicanal",
    "Materiais de apoio para campanhas",
    "Planejamento editorial mensal",
    "Reunião mensal de alinhamento",
    "Relatório de performance",
    "Time dedicado de 6 profissionais",
  ];

  return (
    <section className="proposal">
      <h2>
        <WordReveal segments={[{ text: "Sua proposta personalizada" }]} />
      </h2>
      <Reveal index={1} className="recurrence">
        <CalendarBlank weight="light" />
        <span>Recorrência mensal</span>
      </Reveal>
      <div className="price-card">
        <StaggerList className="included">
          <motion.p className="overline" variants={listItem}>O QUE ESTÁ INCLUSO</motion.p>
          {included.map((item) => (
            <motion.p className="included-row" key={item} variants={listItem}>
              <Check weight="regular" />
              <span>{item}</span>
            </motion.p>
          ))}
        </StaggerList>
        <Reveal className="price" y={24} amount={0.3}>
          <p>
            <span>R$</span>
            <strong><CountUp to={12000} format={fmtThousands} /></strong>
            <span>/ mês</span>
          </p>
          <hr />
          <small>*Condição comercial a alinhar</small>
          <button type="button">Aprovar proposta</button>
          <em>Proposta válida por 7 dias</em>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <Brand />
      <span>Todos os direitos reservados.</span>
    </footer>
  );
}

function App() {
  return (
    <main>
      <Hero />
      <Marquee />
      <Overview />
      <Scope />
      <Materials />
      <Strategy />
      <StartSection />
      <Team />
      <Proposal />
      <Footer />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
