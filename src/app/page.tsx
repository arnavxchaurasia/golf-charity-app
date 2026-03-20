"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-black text-white">

      {/* 🔥 Gradient Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[600px] h-[600px] bg-blue-500/20 blur-3xl rounded-full -top-40 -left-40" />
        <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full bottom-0 right-0" />
      </div>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-36 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-6xl md:text-7xl font-semibold leading-tight">
            Play. Win.
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Give Back.
            </span>
          </h1>

          <p className="mt-8 text-xl text-gray-400 max-w-2xl">
            Track your golf scores, enter monthly prize draws,
            and contribute to meaningful charities — all in one modern platform.
          </p>

          <div className="mt-10 flex gap-6 flex-wrap">
            <Link
              href="/auth/signup"
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition shadow-lg"
            >
              Get Started
            </Link>

            <Link
              href="/leaderboard"
              className="px-8 py-4 rounded-xl border border-gray-700 hover:bg-gray-900 transition"
            >
              View Leaderboard
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 🔥 SOCIAL PROOF */}
      <section className="max-w-6xl mx-auto px-6 pb-20 text-center">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { value: "₹10K+", label: "Donated to charities" },
            { value: "100+", label: "Active players" },
            { value: "₹50K+", label: "Prize pool distributed" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-6 border border-gray-800 rounded-2xl bg-gray-900/50"
            >
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-gray-400 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🔥 FEATURES */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "Track Performance",
              desc: "Log your latest golf scores and monitor consistency.",
            },
            {
              title: "Win Monthly Prizes",
              desc: "Participate in automated draw-based rewards.",
            },
            {
              title: "Support Charity",
              desc: "A portion of your subscription funds real causes.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl border border-gray-800 bg-gray-900/50 backdrop-blur hover:shadow-xl transition"
            >
              <h3 className="text-2xl font-semibold">{f.title}</h3>
              <p className="mt-4 text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🔥 HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-6 pb-28 text-center">
        <h2 className="text-4xl font-semibold">How it works</h2>

        <div className="grid md:grid-cols-3 gap-10 mt-16">
          {[
            "Subscribe to the platform",
            "Enter your latest 5 scores",
            "Win rewards & support charity",
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-6 border border-gray-800 rounded-2xl"
            >
              <p className="text-lg">{step}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🔥 TRUST / TRANSPARENCY */}
      <section className="max-w-5xl mx-auto px-6 pb-28 text-center">
        <h2 className="text-3xl font-semibold mb-6">
          Built for Transparency & Trust
        </h2>

        <p className="text-gray-400 max-w-2xl mx-auto">
          Every draw is fair, every winner is verified, and every donation is tracked.
          We prioritize transparency to ensure a trustworthy and engaging experience.
        </p>
      </section>

      {/* 🔥 FINAL CTA */}
      <section className="text-center pb-32">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-5xl font-semibold"
        >
          Ready to make every round count?
        </motion.h2>

        <Link
          href="/auth/signup"
          className="inline-block mt-10 px-10 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 transition shadow-xl"
        >
          Join Now
        </Link>
      </section>
    </div>
  );
}