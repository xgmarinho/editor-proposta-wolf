import React from "react";
import { motion } from "motion/react";
import {
  ArrowUpRight, BoundingBox, CalendarBlank, CaretDown, Check, Cursor, Notepad,
  PenNib, Square, UsersThree, WarningCircle,
} from "@phosphor-icons/react";
import {
  EASE, listItem, useMotionEnabled, Reveal, CountUp, fmtPad2, fmtThousands,
  StaggerList, WordReveal, StackList, Timeline,
} from "./motion.jsx";
import { getIcon } from "../data/iconRegistry.js";
import { splitHeading } from "../data/proposalOps.js";
import isotipo from "../assets/Isotipo.svg";

// Resolve uma string de imagem: "asset:fotos/1.png" -> URL do bundle; data URL/URL -> passa direto.
const assetUrls = import.meta.glob("../assets/**/*", { eager: true, import: "default", query: "?url" });
export function resolveImg(src) {
  if (typeof src !== "string") return src;
  if (src.startsWith("asset:")) return assetUrls["../assets/" + src.slice(6)] || src;
  return src; // data: URL ou http(s)
}

function Brand({ data, className = "" }) {
  return (
    <div className={`brand ${className}`}>
      <img src={isotipo} alt="" />
      <span>{data.hero.brandName}</span>
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

export function Hero({ data }) {
  const enabled = useMotionEnabled();
  return (
    <section className="hero">
      <motion.div
        className="hero-brand"
        initial={enabled ? { opacity: 0, y: -8 } : false}
        animate={enabled ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <Brand data={data} />
      </motion.div>
      <h1>
        <WordReveal
          from="up"
          trigger="mount"
          stagger={0.12}
          segments={splitHeading(data.hero.headingText, data.hero.headingStrong)}
        />
      </h1>
      <motion.div
        className="hero-proof"
        initial={enabled ? { opacity: 0, y: 12 } : false}
        animate={enabled ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, ease: EASE, delay: 0.9 }}
      >
        <div className="avatars">
          {data.hero.avatars.map((avatar, index) => (
            <motion.img
              src={resolveImg(avatar)}
              alt=""
              key={index}
              initial={enabled ? { opacity: 0, x: -10 } : false}
              animate={enabled ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.5, ease: EASE, delay: 1 + index * 0.07 }}
            />
          ))}
        </div>
        <p>{data.hero.proofText}</p>
      </motion.div>
    </section>
  );
}

export function Marquee({ data }) {
  const enabled = useMotionEnabled();
  const marqueeLogos = data.marquee.logos;
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
            <img src={resolveImg(logo)} alt="" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function Overview({ data }) {
  const items = data.overview.cards;

  return (
    <section className="section overview">
      <Reveal className="centered">
        <SectionPill number={data.overview.pillNumber} label={data.overview.pillLabel} />
      </Reveal>
      <h2>
        <WordReveal segments={splitHeading(data.overview.headingText, data.overview.headingStrong)} />
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

export function Scope({ data }) {
  const channels = data.scope.channels;

  return (
    <section className="section scope">
      <Reveal className="centered">
        <SectionPill number={data.scope.pillNumber} label={data.scope.pillLabel} />
      </Reveal>
      <h2>
        <WordReveal segments={splitHeading(data.scope.headingText, data.scope.headingStrong)} />
      </h2>
      <Reveal index={1}>
        <p className="section-copy">
          {data.scope.copy}
        </p>
      </Reveal>
      <Reveal index={2} className="metric-row">
        <strong>{data.scope.metric.prefix}<CountUp to={data.scope.metric.value} /></strong>
        <span>{data.scope.metric.label}</span>
      </Reveal>
      <div className="channel-list">
        {channels.map((channel, index) => {
          const Icon = getIcon(channel.icon);
          return (
            <Reveal index={index} amount={0.25} className="channel-card" key={channel.title}>
              <Icon className="channel-icon" weight="light" />
              <h3>{channel.title}</h3>
              <div className="channel-lines">
                {channel.lines.map(({ qty, label }) => (
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

export function Materials({ data }) {
  const materials = data.materials.buttons;

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
        <WordReveal segments={splitHeading(data.materials.headingText, data.materials.headingStrong)} />
      </h2>
      <Reveal index={1}>
        <p>{data.materials.copy}</p>
      </Reveal>
      <Reveal index={2} className="light-divider" />
      <Reveal index={3} className="materials-metric">
        <strong>{data.materials.metric.prefix}<CountUp to={data.materials.metric.value} /></strong>
        <span>{data.materials.metric.label}</span>
        <Notepad weight="light" className="metric-icon" />
      </Reveal>
      <div className="material-grid">
        {materials.map((button, index) => {
          const Icon = getIcon(button.icon);
          return (
            <Reveal index={index} amount={0.4} className="material-button" key={button.label}>
              <Icon weight="regular" />
              <span>{button.label}</span>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// Vertical sequential list of strategy cards (one below the other). Replaces the
// old nested horizontal scroll, which felt detached. Each card reveals in order.
function StrategyList({ cards }) {
  return (
    <div className="strategy-list">
      {cards.map((card, index) => {
        const Icon = getIcon(card.icon);
        return (
          <Reveal index={index} amount={0.3} className="mini-card" key={card.title}>
            <Icon weight="light" />
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </Reveal>
        );
      })}
    </div>
  );
}

export function Strategy({ data }) {
  const cards = data.strategy.cards;
  const steps = data.strategy.steps.map((s) => [s.num, s.title, s.body]);

  return (
    <section className="section strategy">
      <Reveal className="centered">
        <SectionPill number={data.strategy.pillNumber} label={data.strategy.pillLabel} />
      </Reveal>
      <h2>
        <WordReveal segments={splitHeading(data.strategy.headingText, data.strategy.headingStrong)} />
      </h2>
      <StrategyList cards={cards} />
      <h2 className="cycle-title">
        <WordReveal segments={splitHeading(data.strategy.cycleTitleText, data.strategy.cycleTitleStrong)} />
      </h2>
      <Timeline steps={steps} />
    </section>
  );
}

export function StartSection({ data }) {
  const checklist = data.start.checklist;
  const needs = data.start.needs.items;

  return (
    <section className="section start">
      <Reveal className="centered">
        <SectionPill number={data.start.pillNumber} label={data.start.pillLabel} />
      </Reveal>
      <h2>
        <WordReveal segments={splitHeading(data.start.headingText, "")} />
      </h2>
      <Reveal index={1}>
        <p className="section-copy">{data.start.copy}</p>
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
        <motion.h3 variants={listItem}>{data.start.needs.title}</motion.h3>
        {needs.map((item, index) => (
          <motion.p key={item} variants={listItem}>
            <small>{String(index + 1).padStart(2, "0")}</small>
            <span>{item}</span>
          </motion.p>
        ))}
        <motion.div className="warning-card" variants={listItem}>
          <SectionPill number={<WarningCircle weight="light" />} label={data.start.needs.warning.label} />
          <p>{data.start.needs.warning.body}</p>
        </motion.div>
      </StaggerList>
    </section>
  );
}

export function Team({ data }) {
  const people = data.team.people;

  return (
    <section className="team">
      <Reveal className="centered">
        <SectionPill number={data.team.pillNumber} label={data.team.pillLabel} />
      </Reveal>
      <h2>
        <WordReveal segments={splitHeading(data.team.headingText, "")} />
      </h2>
      <Reveal index={2} className="team-metric">
        <strong><CountUp to={data.team.metric.value} format={fmtPad2} /></strong>
        <span>{data.team.metric.label}</span>
        <UsersThree weight="light" />
      </Reveal>
      <StackList
        items={people}
        cardClass="team-card"
        renderCard={(person) => {
          const Icon = getIcon(person.icon);
          return (
            <>
              <small>
                <i /> {person.qty}
              </small>
              <h3>
                {person.role.split("\n").map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </h3>
              <p>{person.body}</p>
              <Icon weight="light" className="team-card-icon" />
              <i className="card-handle" />
            </>
          );
        }}
      />
    </section>
  );
}

export function Proposal({ data }) {
  const included = data.proposal.included;

  return (
    <section className="proposal">
      <h2>
        <WordReveal segments={splitHeading(data.proposal.headingText, "")} />
      </h2>
      <Reveal index={1} className="recurrence">
        <CalendarBlank weight="light" />
        <span>{data.proposal.recurrence}</span>
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
            <span>{data.proposal.price.currency}</span>
            <strong><CountUp to={data.proposal.price.value} format={fmtThousands} /></strong>
            <span>{data.proposal.price.period}</span>
          </p>
          <hr />
          <small>{data.proposal.note}</small>
          <button type="button">{data.proposal.ctaLabel}</button>
          <em>{data.proposal.validity}</em>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer({ data }) {
  return (
    <footer>
      <Brand data={data} />
      <span>Todos os direitos reservados.</span>
    </footer>
  );
}
