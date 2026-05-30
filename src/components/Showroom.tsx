/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowUpRight, Cpu, Layers, Sparkles, Terminal } from "lucide-react";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  metric: string;
  tags: string[];
  icon: React.ComponentType<any>;
}

const PROJECTS: Project[] = [
  {
    id: "mern-vr",
    title: "MERN Stack VR Architecture",
    category: "INTERACTIVE SYSTEM INFRASTRUCTURE",
    description: "An ultra-high-throughput, edge-synchronized microservice cluster executing volumetric state transfers and spatial data sync under 12ms. Optimized for decentralized spatial networks.",
    metric: "12ms Spatial Latency",
    tags: ["Node.js", "WebRTC", "Docker", "Redis Cluster"],
    icon: Cpu
  },
  {
    id: "pixify",
    title: "Pixify Neural Photo Processor",
    category: "COMPUTER VISION PLATFORM",
    description: "Sub-second browser-based neural filtration driven entirely by WebGPU bilateral grid shaders. Executes multi-spectral lighting correction within Sandboxed canvas runtimes.",
    metric: "300% Core Performance",
    tags: ["WebGPU", "WGSL", "WASM", "TensorFlow.js"],
    icon: Sparkles
  },
  {
    id: "morphic",
    title: "Morphic Vector Storefront",
    category: "NEXT-GEN COMMERCE ENGINE",
    description: "A luxury commerce engine utilizing physical-modeling 3D interactions and active product mesh manipulation alongside modular state ledgers and unified transactions.",
    metric: "99.98% Conversion Lift",
    tags: ["React Three Fiber", "GLSL shaders", "Zustand", "Tailwind CSS"],
    icon: Layers
  }
];

interface ShowroomProps {
  scrollProgress: number;
  isInverted: boolean;
}

export const Showroom: React.FC<ShowroomProps> = ({ scrollProgress, isInverted }) => {
  // Pre-breach scroll guide opacity calculation
  const guideOpacity = Math.max(0, Math.min(1, (0.25 - scrollProgress) / 0.15));
  
  // Phase 2 transition flash overlay
  const flashOpacity = scrollProgress >= 0.52 && scrollProgress <= 0.58 
    ? (scrollProgress < 0.55 ? (scrollProgress - 0.52) / 0.03 : 1.0 - (scrollProgress - 0.55) / 0.03) 
    : 0;

  // Showroom fade-in progress (normalize 0.55 to 0.75 for beautiful scroll entry)
  const showroomProgress = Math.max(0, Math.min(1, (scrollProgress - 0.55) / 0.2));
  const showroomStyle = {
    opacity: showroomProgress,
    transform: `translateY(${(1.0 - showroomProgress) * 40}px)`,
    display: scrollProgress < 0.52 ? "none" : "block",
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* 1. Pre-Portal Submerged Floating Cues (Phase 1) with Bold Typography Theme */}
      {!isInverted && (
        <div 
          className="fixed left-0 right-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center z-30 pointer-events-none px-4"
          style={{ opacity: guideOpacity }}
        >
          <div className="text-[10px] tracking-[0.4em] text-purple-400 font-bold uppercase mb-6 select-none animate-pulse">
            01 // SYSTEM_CORRIDOR
          </div>
          
          <h1 className="font-display font-black text-6xl sm:text-7xl md:text-[7rem] leading-[0.85] tracking-tighter text-purple-500 uppercase select-none">
            Liquid<br/>
            <span className="text-transparent" style={{ WebkitTextStroke: "1.5px #A855F7" }}>Ink</span>
          </h1>
          
          <p className="font-display font-black text-3xl sm:text-4xl md:text-[3.5rem] tracking-[0.2em] text-transparent uppercase select-none mt-2 leading-none" style={{ WebkitTextStroke: "1.5px #A855F7" }}>
            ZEXAN
          </p>

          <p className="mt-8 text-xs tracking-[0.25em] text-purple-300/60 uppercase max-w-[280px] leading-relaxed select-none">
            Deep hydro-acoustic immersion within the amoled void.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <div className="w-12 h-px bg-purple-500/50"></div>
            <span className="text-[10px] tracking-widest uppercase text-purple-400/80 font-mono font-bold">
              Muffled Drone Active
            </span>
          </div>
          
          <div className="flex flex-col items-center gap-1.5 text-center mt-6">
            <span className="font-mono text-[9px] text-[#555562] uppercase tracking-[0.2em]">
              Scroll Progress: {Math.round(scrollProgress * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* 2. Visual Breakthrough Flash Buffer (Phase 2) */}
      {flashOpacity > 0 && (
        <div 
          className="fixed inset-0 bg-white z-[99] pointer-events-none transition-opacity duration-75"
          style={{ opacity: flashOpacity }}
        />
      )}

      {/* 3. Inverted Post-Portal Internal Showroom (Phase 3) */}
      <div 
        className="relative w-full max-w-7xl mx-auto px-6 pt-36 pb-32 z-30 pointer-events-auto"
        style={showroomStyle}
      >
        {/* Gallery Header featuring Bold Typography HUD & Elements */}
        <div className="mb-20 max-w-4xl relative">
          {/* Glass Chime HUD Overlay (Top Right of Showroom Frame) */}
          <div className="absolute top-0 right-0 md:flex hidden items-center gap-6 select-none bg-[#F8F9FA]/60 backdrop-blur-md p-4 rounded-xl border border-black/10">
            <div className="text-right">
              <div className="text-[10px] tracking-widest font-bold uppercase text-[#0A0A0C]">Acoustic State</div>
              <div className="text-xs text-purple-600 font-mono font-bold">CRYSTAL_CHIME.WAV</div>
            </div>
            <div className="w-10 h-10 border border-black rounded-full flex items-center justify-center text-[10px] font-mono font-black text-[#0A0A0C]">
              {Math.min(100, Math.round(scrollProgress * 100))}%
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <Terminal className="w-4 h-4 text-deep-ink" />
            <span className="font-mono text-[10px] tracking-widest text-[#66666e] uppercase font-black">
              03 // SHOWROOM_ACCESS // ACTIVE
            </span>
          </div>
          
          <h2 className="font-display text-5xl sm:text-7xl md:text-[7.5rem] font-black tracking-tighter leading-[0.9] mb-12 uppercase text-deep-ink text-left">
            BREACH<br/>
            <span className="text-transparent" style={{ WebkitTextStroke: "2.5px #0A0A0C" }}>SUCCESS</span>
          </h2>
          
          <p className="font-sans text-base sm:text-lg text-[#44444a] leading-relaxed max-w-2xl">
            You have successfully breached the surface boundary. The liquid chrome mirror is now a fully illuminated platinum white chamber containing three premium multi-threaded micro-environments. Explore the active system modules below.
          </p>
        </div>

        {/* Project Bento / Column Matrix Grid matching theme layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {PROJECTS.map((proj, idx) => {
            const IconComponent = proj.icon;
            return (
              <div
                key={proj.id}
                id={`project-${proj.id}`}
                className="group relative flex flex-col justify-between border-t border-black/10 pt-6 hover:border-purple-600/30 transition-all duration-300 cursor-pointer"
              >
                {/* Information Segment */}
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-purple-600 uppercase mb-3 block">
                    PROJECT 0{idx + 1} // {proj.metric}
                  </span>
                  
                  <h3 className="font-display text-xl font-bold uppercase mb-3 text-deep-ink group-hover:text-purple-600 transition-all duration-300">
                    {proj.title.replace("MERN Stack VR Architecture", "MERN Arch").replace("Pixify Neural Photo Processor", "Pixify Pro").replace("Morphic Vector Storefront", "Morphic Store")}
                  </h3>
                  
                  <p className="font-sans text-xs text-gray-500 font-medium leading-relaxed mb-6">
                    {proj.description}
                  </p>
                </div>

                {/* Tags Section */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {proj.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag} 
                        className="font-mono text-[9px] text-[#55555a] bg-slate-100 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-deep-ink font-bold group-hover:gap-2.5 transition-all duration-300 border-t border-black/5 pt-3">
                    Explore Architecture
                    <ArrowUpRight className="w-3 h-3 text-purple-600" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Card 4 - Core Status interactive progress widget from Design Theme */}
          <div className="border-t border-black/10 pt-6 group flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-purple-600 uppercase mb-3 block">
                CORE STATUS
              </span>
              <h3 className="font-display text-xl font-bold uppercase mb-3 text-deep-ink">
                PLATINUM
              </h3>
              <p className="font-sans text-xs text-gray-500 font-medium leading-relaxed mb-6">
                Direct spatial reflection matrices aligned flawlessly to the physical viewport depth ratio.
              </p>
            </div>

            <div className="mt-auto">
              <div className="flex gap-1.5 mt-2">
                <div className="w-full h-1 bg-[#0A0A0C]"></div>
                <div className="w-full h-1 bg-[#0A0A0C]"></div>
                <div className="w-full h-1 bg-[#0A0A0C]"></div>
                <div className="w-full h-1 bg-[#0A0A0C] opacity-30 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/5">
                <span className="font-mono text-[9px] text-gray-400 font-bold uppercase">System Active</span>
                <span className="font-mono text-[9px] text-purple-600 font-bold">100% SECURE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Footer Credits matching Design Theme */}
        <div className="mt-28 pt-8 border-t border-black/10 flex flex-col sm:flex-row justify-between items-end gap-6">
          <div className="text-[10px] uppercase tracking-widest font-black text-deep-ink">
            &copy; 2026 LIQUID INK PORTAL // INTERNAL ACCESS
          </div>
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-8 py-3 bg-[#0A0A0C] hover:bg-purple-600 text-white text-[11px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer"
          >
            Continue Journey
          </div>
        </div>
      </div>
    </div>
  );
};
