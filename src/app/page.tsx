"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import SkillsSection from "@/components/SkillsSection";
import TimelineSection from "@/components/TimelineSection";
import ProjectsSection from "@/components/ProjectsSection";
import ContactSection from "@/components/ContactSection";
import TelemetryFooter from "@/components/TelemetryFooter";

const PCBBackground = dynamic(() => import("@/components/PCBBackground"), {
  ssr: false,
});
const ChatWidget = dynamic(() => import("@/components/ChatWidget"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* PCB Background - only behind hero */}
      <div className="relative">
        <PCBBackground />
        <HeroSection />
      </div>

      {/* Main Sections */}
      <main>
        <AboutSection />
        <SkillsSection />
        <TimelineSection />
        <ProjectsSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <TelemetryFooter />

      {/* Chat Widget (floating) */}
      <ChatWidget />
    </div>
  );
}
