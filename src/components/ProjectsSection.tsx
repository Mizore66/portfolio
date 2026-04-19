"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { resumeData } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

export default function ProjectsSection() {
  const [[page, direction], setPage] = useState([0, 0]);

  // Wrap around index safely
  const imageIndex = (page % resumeData.projects.length + resumeData.projects.length) % resumeData.projects.length;
  const project = resumeData.projects[imageIndex];

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const colors = ["#00ffaa", "#00ccff", "#aa55ff", "#ff5599", "#ffaa00", "#ff6644", "#44ddff"];
  const color = colors[imageIndex % colors.length];

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.9,
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.9,
      };
    },
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <section id="projects" className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <p className="text-primary font-mono text-sm tracking-widest uppercase mb-2">
            // Featured Work
          </p>
          <h2 className="font-bold text-foreground flex items-center gap-4">
            Project <span className="text-primary glow-text">Showcase</span>
          </h2>
          
          {/* Navigation Controls (Desktop centered above card) */}
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={() => paginate(-1)}
              className="p-3 rounded-full border border-border/50 bg-background/50 backdrop-blur hover:bg-primary/10 hover:border-primary/50 transition-all text-muted-foreground hover:text-primary z-20 shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="font-mono text-sm text-muted-foreground min-w-[3rem] text-center">
              {imageIndex + 1} / {resumeData.projects.length}
            </div>
            <button
              onClick={() => paginate(1)}
              className="p-3 rounded-full border border-border/50 bg-background/50 backdrop-blur hover:bg-primary/10 hover:border-primary/50 transition-all text-muted-foreground hover:text-primary z-20 shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative min-h-[700px] w-full max-w-5xl mx-auto perspective-[1200px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="w-full glass shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing border-border"
              // Sharper corners for a more serious/technical look
              style={{ borderRadius: '4px' }}
            >
              {/* Dynamic Top bar gradient */}
              <div
                className="h-2 w-full"
                style={{
                  background: `linear-gradient(90deg, ${color}, transparent)`,
                }}
              />
              
              <div className="p-8 md:p-12 w-full flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-12">
                {/* Left side: Context & Links */}
                <div className="md:col-span-4 flex flex-col justify-between">
                  <div>
                    <Badge
                      variant="outline"
                      className="font-mono text-xs mb-6 px-3 py-1"
                      style={{ borderColor: `${color}50`, color }}
                    >
                      {project.date}
                    </Badge>
                    
                    <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-2 leading-tight">
                      {project.name}
                    </h3>
                    <p className="text-lg text-muted-foreground font-mono leading-relaxed opacity-80 mb-8">
                      {project.subtitle}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {project.tech.map((t, i) => (
                        <Badge
                          key={i}
                          className="text-xs font-mono px-2 py-0.5"
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
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-background/30 border border-border/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">
                        Measurable Impact
                      </p>
                      <p className="text-xl font-bold font-mono" style={{ color }}>
                        {project.impact}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded transition-all hover:brightness-110"
                      >
                        View Case Study
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded text-foreground font-semibold transition-all hover:bg-muted/50"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub Repo
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right side: Image block placeholder & Bullets */}
                <div className="md:col-span-8 flex flex-col">
                  {/* Decorative Project Context background/block */}
                  <div className="relative w-full h-[200px] rounded mb-6 bg-gradient-to-br from-background/40 to-background/10 border border-border flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }} />
                    <svg className="w-16 h-16 opacity-30" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  <div className="space-y-4 text-muted-foreground lg:text-lg pr-4">
                    {project.bullets.map((bullet, i) => (
                      <div key={i} className="flex gap-4">
                        <span style={{ color }} className="shrink-0 font-mono mt-1 opacity-70">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
