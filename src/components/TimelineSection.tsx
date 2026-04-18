"use client";

import { motion } from "framer-motion";
import { resumeData } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

export default function TimelineSection() {
  return (
    <section id="experience" className="py-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-mono text-sm tracking-widest uppercase mb-2">
            // Experience Ledger
          </p>
          <h2 className="font-bold text-foreground">
            The <span className="text-primary glow-text">Ledger</span> Timeline
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent md:-translate-x-px" />

          {resumeData.experience.map((exp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className={`relative mb-12 md:mb-16 ${
                idx % 2 === 0
                  ? "md:pr-[calc(50%+2rem)] md:text-right"
                  : "md:pl-[calc(50%+2rem)]"
              } pl-20 md:pl-0`}
            >
              {/* Node dot */}
              <div className="absolute left-6 md:left-1/2 top-2 md:-translate-x-1/2 z-10">
                <div className="w-4 h-4 rounded-sm rotate-45 bg-primary border-2 border-background shadow-[0_0_12px_var(--neon-glow)]" />
              </div>

              {/* Block card mimicking blockchain block */}
              <div className="glass rounded-xl p-6 border border-border hover:glow-box transition-all duration-300 group">
                {/* Block header */}
                <div
                  className={`flex items-center gap-2 mb-3 font-mono text-xs text-muted-foreground ${
                    idx % 2 === 0 ? "md:justify-end" : ""
                  }`}
                >
                  <span className="text-primary">BLOCK #{String(idx).padStart(3, "0")}</span>
                  <span>|</span>
                  <span>{exp.period}</span>
                </div>

                {/* Title & company */}
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {exp.title}
                </h3>
                {exp.company && (
                  <p className="text-primary font-semibold mb-1">{exp.company}</p>
                )}
                {exp.type && (
                  <Badge variant="outline" className="mb-3 text-xs border-primary/30 text-primary/80">
                    {exp.type}
                  </Badge>
                )}

                {/* Tech stack */}
                <div className={`flex flex-wrap gap-1.5 mb-4 ${idx % 2 === 0 ? "md:justify-end" : ""}`}>
                  {exp.tech.map((t, i) => (
                    <Badge
                      key={i}
                      className="bg-primary/10 text-primary border-primary/20 text-xs font-mono"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>

                {/* Bullets */}
                <ul className={`space-y-2 text-sm text-muted-foreground ${idx % 2 === 0 ? "md:text-right" : ""}`}>
                  {exp.bullets.map((bullet, i) => (
                    <li key={i} className={`flex gap-2 ${idx % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                      <span className="text-primary shrink-0 mt-1">▸</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* Impact metric */}
                <div
                  className={`mt-4 pt-3 border-t border-border/50 font-mono text-xs flex items-center gap-2 ${
                    idx % 2 === 0 ? "md:justify-end" : ""
                  }`}
                >
                  <span className="text-muted-foreground">IMPACT:</span>
                  <span className="text-primary font-bold">{exp.impact}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
