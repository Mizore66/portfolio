"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const metrics = [
  { label: "Region", value: "ap-southeast-1", icon: "🌏" },
  { label: "Latency", value: "<50ms", icon: "⚡" },
  { label: "K8s Pod", value: "Healthy", icon: "🟢" },
  { label: "ECS Fargate", value: "Active", icon: "☁️" },
  { label: "Uptime", value: "99.97%", icon: "📊" },
];

export default function TelemetryFooter() {
  const [responseTime, setResponseTime] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setResponseTime(Math.floor(Math.random() * 15) + 35);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Status */}
          <div className="flex items-center gap-4 overflow-x-auto">
            {metrics.map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-1.5 shrink-0"
              >
                <span className="text-xs">{metric.icon}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {metric.label}:
                </span>
                <span className="text-xs text-primary font-mono font-bold">
                  {metric.label === "Latency" ? `${responseTime}ms` : metric.value}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Right: Build info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground/50 font-mono shrink-0">
            <span>Next.js 15</span>
            <span>•</span>
            <span>R3F</span>
            <span>•</span>
            <span>Groq AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
