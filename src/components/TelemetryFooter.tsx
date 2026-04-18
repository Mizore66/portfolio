"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

/* Minimal SVG icons — no emojis */
const GlobeIcon = () => (
  <svg className="w-3 h-3 text-primary/70" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="6.5" />
    <path d="M1.5 8h13M8 1.5c-2 2.5-2 9.5 0 13M8 1.5c2 2.5 2 9.5 0 13" />
  </svg>
);
const BoltIcon = () => (
  <svg className="w-3 h-3 text-primary/70" viewBox="0 0 16 16" fill="currentColor">
    <path d="M9 1L3 9h4v6l6-8H9V1z" />
  </svg>
);
const CircleIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg className="w-2.5 h-2.5" viewBox="0 0 10 10">
    <circle cx="5" cy="5" r="4" fill={color} opacity="0.8" />
    <circle cx="5" cy="5" r="4" fill={color} opacity="0.3">
      <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);
const CloudIcon = () => (
  <svg className="w-3 h-3 text-primary/70" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 12h8a3 3 0 100-6 3.5 3.5 0 00-7 1A2.5 2.5 0 004 12z" />
  </svg>
);
const ChartIcon = () => (
  <svg className="w-3 h-3 text-primary/70" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="9" width="2.5" height="5" rx="0.5" fill="currentColor" opacity="0.4" />
    <rect x="6.75" y="5" width="2.5" height="9" rx="0.5" fill="currentColor" opacity="0.6" />
    <rect x="11.5" y="2" width="2.5" height="12" rx="0.5" fill="currentColor" opacity="0.8" />
  </svg>
);

const metrics = [
  { label: "Region", value: "ap-southeast-1", icon: <GlobeIcon /> },
  { label: "Latency", value: "<50ms", icon: <BoltIcon /> },
  { label: "K8s Pod", value: "Healthy", icon: <CircleIcon color="#34d399" /> },
  { label: "ECS Fargate", value: "Active", icon: <CloudIcon /> },
  { label: "Uptime", value: "99.97%", icon: <ChartIcon /> },
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
    <footer className="relative border-t border-border/50 bg-background/80 backdrop-blur-sm">
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
                {metric.icon}
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
