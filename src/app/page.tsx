"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
} from "framer-motion";
import type { Variants } from "framer-motion";
import { useEffect, useState } from "react";

const words = ["joy", "impact", "hope", "momentum"];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-flex items-baseline ml-2">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: "0.4em", filter: "blur(6px)" }}
          animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
          exit={{ opacity: 0, y: "-0.4em", filter: "blur(6px)" }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground shadow-sm">
      {children}
    </div>
  );
}

function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="group rounded-3xl border border-border bg-gradient-to-br from-white to-slate-50 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <p className="text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>

      {/* subtle accent line */}
      <div className="mt-4 h-[2px] w-0 bg-gradient-to-r from-blue-600 to-violet-600 transition-all group-hover:w-full" />
    </div>
  );
}

function FeatureCard({
  title,
  desc,
  eyebrow,
}: {
  title: string;
  desc: string;
  eyebrow: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -8 }}
      className="group rounded-[1.75rem] border border-border bg-gradient-to-br from-white via-slate-50 to-white p-7 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition"
    >
      <div className="mb-5 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        {eyebrow}
      </div>

      <h3 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h3>

      <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
        {desc}
      </p>

      <div className="mt-6 h-[2px] w-0 bg-gradient-to-r from-blue-600 to-violet-600 transition-all group-hover:w-full" />
    </motion.div>
  );
}

function TimelineStep({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5 }}
      className="group rounded-[1.75rem] border border-border bg-gradient-to-br from-white to-slate-50 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-lg font-semibold text-slate-900">
        {number}
      </div>
      <h4 className="text-lg font-semibold tracking-tight">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
    </motion.div>
  );
}

function CharityCard({
  image,
  name,
  desc,
  tag,
}: {
  image: string;
  name: string;
  desc: string;
  tag: string;
}) {
  return (
    <div className="min-w-[320px] max-w-[320px] rounded-[1.75rem] border border-border bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(15,23,42,0.10)]">
      <div className="overflow-hidden rounded-[1.35rem]">
        <img
          src={image}
          alt={name}
          className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700">
          {tag}
        </div>
        <h4 className="text-lg font-semibold tracking-tight">{name}</h4>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function MarqueeRow({
  items,
}: {
  items: string[];
}) {
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-border bg-gradient-to-r from-white via-slate-50 to-white">
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-white via-transparent to-white" />

      <div className="marquee-track flex min-w-max items-center gap-6 py-5 hover:[animation-play-state:paused]">
        {doubled.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="rounded-full border border-border bg-white/80 backdrop-blur px-5 py-2 text-sm text-slate-700 shadow-sm transition hover:shadow-md"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 25,
    restDelta: 0.001,
  });

  const marqueeItems = [
    "Transparent monthly draws",
    "Five-score rolling system",
    "Charity-first subscriptions",
    "Verified winner payouts",
    "Leaderboard visibility",
    "Admin-controlled publishing",
  ];

  const charityItems = [
    {
      image:
        "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=1200&auto=format&fit=crop",
      name: "Children’s Learning Fund",
      desc: "Support education, access, and opportunity for young learners.",
      tag: "Spotlight charity",
    },
    {
      image:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop",
      name: "Community Health Drive",
      desc: "Funding care, medicine, and practical support where it matters most.",
      tag: "High impact",
    },
    {
      image:
        "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?q=80&w=1200&auto=format&fit=crop",
      name: "Green Futures Program",
      desc: "Backing sustainable initiatives that improve everyday lives.",
      tag: "Monthly highlight",
    },
  ];

  return (
    <div className="relative isolate overflow-hidden bg-background text-foreground">
     <style jsx global>{`
  html {
    scroll-behavior: smooth;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @keyframes floaty {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .marquee-track {
    animation: marquee 26s linear infinite;
  }

  .floaty {
    animation: floaty 7s ease-in-out infinite;
  }
`}</style>

      <motion.div
        style={{ scaleX }}
        className="fixed left-0 right-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-blue-600 via-violet-500 to-fuchsia-500"
      />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_30%),radial-gradient(circle_at_right,_rgba(168,85,247,0.08),_transparent_26%),linear-gradient(to_bottom,_rgba(255,255,255,1),_rgba(248,250,252,1))]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

      <section className="section pt-28 lg:pt-36">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp}>
              <SectionLabel>Play • Win • Give Back</SectionLabel>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="max-w-2xl text-5xl font-semibold tracking-tight leading-[1.05] md:text-6xl xl:text-7xl"
            >
              Golf that turns every round into{" "}
              <RotatingWord />
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg"
            >
              A calm, premium experience where your game supports a cause,
              unlocks monthly rewards, and feels effortless from signup to
              draw night.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                href="/auth/signup"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-600/15 transition hover:opacity-90 active:scale-[0.98]"
              >
                Get Started
              </Link>
              <Link
                href="/leaderboard"
                className="rounded-xl border border-border bg-white px-6 py-3.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
              >
                Explore Leaderboard
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-10 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3"
            >
              <StatCard value="₹10K+" label="Donated to charities" />
              <StatCard value="100+" label="Active players" />
              <StatCard value="₹50K+" label="Prize pool distributed" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="floaty relative overflow-hidden rounded-[2rem] border border-border bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
              <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="relative overflow-hidden rounded-[1.5rem]">
                  <img
                    src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1600&auto=format&fit=crop"
                    alt="Golf course"
                    className="h-[420px] w-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur">
                    Monthly draw
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-[1.35rem] border border-border bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      This month
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">
                      ₹12,480 donated
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Directly split from subscriptions.
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-[1.35rem]">
                    <img
                      src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=1200&auto=format&fit=crop"
                      alt="Golf ball"
                      className="h-40 w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="rounded-[1.35rem] border border-border bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      Live product
                    </p>
                    <div className="mt-3 space-y-3">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span>Prize pool</span>
                          <span className="text-muted-foreground">72%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-2 w-[72%] rounded-full bg-gradient-to-r from-blue-600 to-violet-600" />
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span>Charity share</span>
                          <span className="text-muted-foreground">18%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-2 w-[18%] rounded-full bg-emerald-500" />
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span>Platform ops</span>
                          <span className="text-muted-foreground">10%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-2 w-[10%] rounded-full bg-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="absolute -bottom-5 left-6 rounded-2xl border border-border bg-white px-4 py-3 shadow-lg"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Verified payout
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  Fast, fair, and visible to every user.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pt-6">
        <MarqueeRow items={marqueeItems} />
      </section>

      <section className="section">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>Built like a real product</SectionLabel>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
                A simple experience with a premium feel.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Every screen is designed to feel clear, emotional, and polished
                so users understand the value immediately.
              </p>
            </div>
          </motion.div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <FeatureCard
              eyebrow="Score tracking"
              title="Record your five latest scores"
              desc="A clean, focused flow that makes score entry feel quick and effortless."
            />
            <FeatureCard
              eyebrow="Monthly draws"
              title="Turn participation into anticipation"
              desc="The prize flow feels exciting without becoming noisy or cluttered."
            />
            <FeatureCard
              eyebrow="Charity impact"
              title="Make giving visible and meaningful"
              desc="Every contribution feels real because the experience shows exactly where it goes."
            />
          </div>
        </motion.div>
      </section>

      <section className="section">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>The experience</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="max-w-xl text-3xl font-semibold tracking-tight md:text-4xl"
            >
              The journey feels calm, personal, and easy to trust.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground md:text-base"
            >
              From signup to the final draw, the site should feel like a modern
              membership platform rather than a typical sports app.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 grid gap-4 sm:grid-cols-2"
            >
              <TimelineStep
                number="01"
                title="Subscribe"
                desc="Choose monthly or yearly with a premium, frictionless checkout flow."
              />
              <TimelineStep
                number="02"
                title="Add scores"
                desc="Keep the latest five Stableford scores updated in a clean dashboard."
              />
              <TimelineStep
                number="03"
                title="Choose a charity"
                desc="Let users feel the emotional connection from the very first click."
              />
              <TimelineStep
                number="04"
                title="Celebrate wins"
                desc="Reveal winners, donations, and outcomes in a satisfying monthly rhythm."
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-border bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                <div className="overflow-hidden rounded-[1.5rem]">
                  <img
                    src="https://images.unsplash.com/photo-1472220625704-91e1462799b2?q=80&w=1400&auto=format&fit=crop"
                    alt="Golf swing"
                    className="h-full min-h-[360px] w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.5rem] border border-border bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      Subscription status
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">
                      Active
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Renewal: 28 Mar 2026
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-border bg-white p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      Current participation
                    </p>
                    <div className="mt-4 space-y-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span>Draws entered</span>
                          <span className="font-medium">12</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-2 w-[76%] rounded-full bg-gradient-to-r from-blue-600 to-violet-600" />
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span>Charity selected</span>
                          <span className="font-medium">Yes</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-2 w-[100%] rounded-full bg-emerald-500" />
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span>Winnings status</span>
                          <span className="font-medium">Pending</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-2 w-[42%] rounded-full bg-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[1.5rem] border border-border bg-gradient-to-br from-blue-50 to-violet-50 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      Emotional cue
                    </p>
                    <p className="mt-2 text-lg font-medium tracking-tight text-slate-900">
                      Small actions. Real help. Better stories.
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      That is the feeling the homepage should leave behind.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>Featured charities</SectionLabel>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl"
          >
            The charity section should feel warm, human, and alive.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base"
          >
            Use generous imagery, real spacing, and short copy so the user feels
            the impact immediately.
          </motion.p>
        </motion.div>

        <div className="mt-10 overflow-hidden">
          <div className="marquee-track flex min-w-max gap-5">
            {charityItems.concat(charityItems).map((item, index) => (
              <CharityCard key={`${item.name}-${index}`} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>Why people stay</SectionLabel>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="max-w-xl text-3xl font-semibold tracking-tight md:text-4xl"
            >
              The site should make people feel part of something bigger.
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground md:text-base"
            >
              The emotional layer matters as much as the mechanics: trust,
              transparency, celebration, and visible good.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 grid gap-4 sm:grid-cols-2"
            >
              <div className="rounded-[1.5rem] border border-border bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <p className="text-3xl font-semibold tracking-tight">4.9/5</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Confidence in the platform
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <p className="text-3xl font-semibold tracking-tight">96%</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Users understand the mission quickly
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-4"
          >
            <motion.div
              variants={fadeUp}
              className="rounded-[2rem] border border-border bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
            >
              <p className="text-sm leading-7 text-muted-foreground">
                “The interface should feel like a premium membership platform,
                not a generic golf site.”
              </p>
              <p className="mt-3 text-sm font-medium text-foreground">
                Product direction
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
            >
              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1400&auto=format&fit=crop"
                alt="Community"
                className="h-72 w-full object-cover"
                loading="lazy"
              />
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="grid gap-4 md:grid-cols-3"
            >
              <div className="rounded-[1.5rem] border border-border bg-white p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Calm UI
                </p>
                <p className="mt-2 text-base font-medium">
                  Clear hierarchy everywhere
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border bg-white p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Motion
                </p>
                <p className="mt-2 text-base font-medium">
                  Soft, intentional transitions
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border bg-white p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Emotion
                </p>
                <p className="mt-2 text-base font-medium">
                  Designed to feel uplifting
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="section pb-36">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="rounded-[2.25rem] border border-border bg-gradient-to-br from-white to-slate-50 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-12"
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>Final call to action</SectionLabel>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl"
          >
            Make every round feel like it matters.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base"
          >
            This is where the UI should close with confidence, warmth, and a
            strong reason to join.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/auth/signup"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-600/15 transition hover:opacity-90 active:scale-[0.98]"
            >
              Join BirdieFund
            </Link>
            <Link
              href="/charities"
              className="rounded-xl border border-border bg-white px-6 py-3.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
            >
              Explore charities
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}