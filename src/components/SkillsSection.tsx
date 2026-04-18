"use client";

import { motion } from "framer-motion";
import { resumeData } from "@/lib/data";

const skillCategories = [
  {
    title: "Languages",
    items: resumeData.skills.languages,
    color: "#00ffaa",
    icon: "⟨/⟩",
  },
  {
    title: "Frameworks",
    items: resumeData.skills.frameworks,
    color: "#00ccff",
    icon: "◈",
  },
  {
    title: "DevOps & Tools",
    items: resumeData.skills.devTools,
    color: "#aa55ff",
    icon: "⚙",
  },
  {
    title: "Libraries & ML",
    items: resumeData.skills.libraries,
    color: "#ff5599",
    icon: "◆",
  },
  {
    title: "Databases",
    items: resumeData.skills.databases,
    color: "#ffaa00",
    icon: "⛃",
  },
];

export default function SkillsSection() {
  return (
    <section id="skills" className="py-24 px-6 relative">
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
            // Technical Arsenal
          </p>
          <h2 className="font-bold text-foreground">
            Core <span className="text-primary glow-text">Skills</span>
          </h2>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, catIdx) => (
            <motion.div
              key={catIdx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: catIdx * 0.1 }}
              className="glass rounded-xl p-6 group hover:glow-box transition-all duration-300"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-2xl"
                  style={{ color: category.color }}
                >
                  {category.icon}
                </span>
                <h3
                  className="text-lg font-semibold font-mono"
                  style={{ color: category.color }}
                >
                  {category.title}
                </h3>
              </div>

              {/* Skill Tags */}
              <div className="flex flex-wrap gap-2">
                {category.items.map((skill, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: catIdx * 0.1 + idx * 0.03 }}
                    className="px-3 py-1.5 rounded-md text-sm font-mono transition-all duration-200 hover:scale-105 cursor-default"
                    style={{
                      background: `${category.color}10`,
                      border: `1px solid ${category.color}30`,
                      color: category.color,
                    }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
