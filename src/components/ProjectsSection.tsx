"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const colors = ["#00ffaa", "#00ccff", "#aa55ff", "#ff5599", "#ffaa00", "#ff6644", "#44ddff"];
  const color = colors[index % colors.length];

  return (
    <Link href={`/projects/${project.slug}`}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformPerspective: 800 }}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="glass rounded-xl overflow-hidden group cursor-pointer h-full"
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
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
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

          {/* Impact + View arrow */}
          <div className="pt-3 border-t border-border/50 flex items-center justify-between">
            <div className="font-mono text-xs">
              <span className="text-muted-foreground">IMPACT: </span>
              <span className="font-bold" style={{ color }}>
                {project.impact}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground/50 font-mono group-hover:text-primary/70 transition-colors">
              View Details
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function ProjectsSection() {
  return (
    <section id="projects" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumeData.projects.map((project, idx) => (
            <ProjectCard key={idx} project={project} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
