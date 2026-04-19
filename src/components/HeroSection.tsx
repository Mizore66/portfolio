"use client";

import { motion } from "framer-motion";
import { resumeData } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[90vh] lg:min-h-screen flex items-center overflow-hidden"
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-24 lg:pt-0">
          
          {/* Left Column Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 xl:col-span-6 text-left"
          >
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <Badge
                variant="outline"
                className="border-primary/50 bg-primary/5 text-primary font-mono text-xs px-3 py-1 glow-border"
              >
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2" />
                SYSTEM ONLINE
              </Badge>
            </motion.div>

            {/* Name — big, embossed, high contrast */}
            <h1 className="font-bold tracking-tight mb-4 hero-title leading-tight">
              <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] block">
                {resumeData.name.split(" ")[0]}{" "}
              </span>
              <span className="text-primary glow-text-strong drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] block pt-1">
                {resumeData.name.split(" ").slice(1).join(" ")}
              </span>
            </h1>

            {/* Headline — higher contrast */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-foreground/80 max-w-xl mb-8 font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
            >
              {resumeData.headline}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap items-center gap-4"
            >
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg transition-all hover:shadow-[0_0_20px_var(--neon-glow)] hover:scale-105"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                View Projects
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg text-foreground font-semibold transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Contact Me
              </a>
            </motion.div>

            {/* Quick stats inline row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="mt-12 flex flex-wrap gap-x-8 gap-y-4"
            >
              {[
                { label: "CGPA", value: resumeData.education.cgpa },
                { label: "Languages", value: `${resumeData.skills.languages.length}+` },
                { label: "Companies", value: "4" },
                { label: "Projects", value: `${resumeData.projects.length}+` },
              ].map((stat, i) => (
                <div key={i} className="">
                  <p className="text-xl font-bold text-primary font-mono drop-shadow-md">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column spacing - handled by the absolute canvas */}
          <div className="lg:col-span-5 xl:col-span-6 hidden lg:block"></div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-1">
          <div className="w-1.5 h-3 bg-primary rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
