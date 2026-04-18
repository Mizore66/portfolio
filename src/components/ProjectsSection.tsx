"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { resumeData } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

function ProjectCard({
  project,
  index,
}: {
  project: (typeof resumeData.projects)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const rotateY = useTransform(x, [-200, 200], [-10, 10]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
  };

  const colors = ["#00ffaa", "#00ccff", "#aa55ff", "#ff5599"];
  const color = colors[index % colors.length];

  return (
    <motion.div
      ref={cardRef}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      style={{ x, rotateY }}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="glass rounded-xl overflow-hidden cursor-grab active:cursor-grabbing group"
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${color}, transparent)`,
        }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">{project.name}</h3>
            <p className="text-sm text-muted-foreground">{project.subtitle}</p>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 font-mono text-xs"
            style={{ borderColor: `${color}50`, color }}
          >
            {project.date}
          </Badge>
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tech.map((t, i) => (
            <Badge
              key={i}
              className="text-xs font-mono"
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

        {/* Bullets */}
        <ul className="space-y-2 text-sm text-muted-foreground mb-4">
          {project.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-2">
              <span style={{ color }} className="shrink-0 mt-0.5">
                ▸
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        {/* Impact */}
        <div
          className="pt-3 border-t border-border/50 flex items-center justify-between"
        >
          <div className="font-mono text-xs">
            <span className="text-muted-foreground">MEASURABLE IMPACT: </span>
            <span className="font-bold" style={{ color }}>
              {project.impact}
            </span>
          </div>
          <div className="text-xs text-muted-foreground/50 font-mono select-none">
            ← DRAG →
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectsSection() {
  return (
    <section id="projects" className="py-24 px-6 relative">
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
            // Featured Work
          </p>
          <h2 className="font-bold text-foreground">
            Project <span className="text-primary glow-text">Showcase</span>
          </h2>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {resumeData.projects.map((project, idx) => (
            <ProjectCard key={idx} project={project} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
