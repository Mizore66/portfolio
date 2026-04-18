"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { resumeData } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

export default function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const project = resumeData.projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const colors = ["#00ffaa", "#00ccff", "#aa55ff", "#ff5599", "#ffaa00", "#ff6644", "#44ddff"];
  const idx = resumeData.projects.indexOf(project);
  const color = colors[idx % colors.length];

  return (
    <div className="min-h-screen bg-background dot-pattern">
      {/* Top bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
          <Link
            href="/#projects"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary font-mono text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Portfolio
          </Link>
          <span className="font-mono text-xs text-muted-foreground/50">{project.date}</span>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p
              className="font-mono text-sm tracking-widest uppercase mb-3"
              style={{ color }}
            >
              // {project.subtitle}
            </p>
            <h1 className="font-bold text-foreground mb-4">{project.name}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {project.description}
            </p>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-wider mb-4">
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t, i) => (
                <Badge
                  key={i}
                  className="text-sm font-mono px-3 py-1"
                  style={{
                    background: `${color}15`,
                    color,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {t}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Key Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-wider mb-4">
              Key Achievements
            </h2>
            <div className="glass rounded-xl p-6 space-y-4">
              {project.bullets.map((bullet, i) => (
                <div key={i} className="flex gap-3">
                  <span style={{ color }} className="shrink-0 mt-1 font-mono text-sm">
                    0{i + 1}
                  </span>
                  <p className="text-muted-foreground">{bullet}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Impact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-12"
          >
            <div className="glass rounded-xl p-6 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}20`, border: `1px solid ${color}40` }}
              >
                <svg className="w-6 h-6" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                  Measurable Impact
                </p>
                <p className="text-xl font-bold font-mono" style={{ color }}>
                  {project.impact}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Gallery Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-wider mb-4">
              Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="glass rounded-xl aspect-video flex items-center justify-center border border-border/30"
                >
                  <div className="text-center">
                    <svg
                      className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-xs text-muted-foreground/40 font-mono">
                      Screenshot {i}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg transition-all hover:shadow-[0_0_20px_var(--neon-glow)] hover:scale-105"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View Repository
            </a>
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg text-foreground font-semibold transition-all hover:border-primary/50 hover:bg-primary/5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Projects
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
