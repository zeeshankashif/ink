/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Volume2, ChevronDown, Play, Sparkles, Terminal } from "lucide-react";

import { AudioEngine } from "./audioEngine";
import { LiquidBlobCanvas } from "./components/LiquidBlob";
import { Showroom } from "./components/Showroom";

// Register GSAP ScrollTrigger plugin safely
gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollTriggerInstance = useRef<ScrollTrigger | null>(null);
  
  // Keep stable reference to Audio Engine class
  const audioEngineRef = useRef<AudioEngine | null>(null);
  // Track threshold crossing to avoid double pop trigger
  const lastProgressRef = useRef<number>(0);

  // Initialize AudioEngine on first register
  useEffect(() => {
    audioEngineRef.current = new AudioEngine();
    
    // Explicit body locking state inside sandboxed previews
    if (!isUnlocked) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      // Complete memory safety loop: clean up audio contexts and styles
      document.body.style.overflow = "unset";
      if (audioEngineRef.current) {
        audioEngineRef.current.cleanup();
      }
    };
  }, []);

  const handleUnlockAudio = async () => {
    if (!audioEngineRef.current) return;
    
    // 1. Initialise Synthesizers under user click context
    await audioEngineRef.current.init();
    setIsUnlocked(true);

    // 2. Clear overflow lock on HTML viewport
    document.body.style.overflow = "unset";

    // 3. GSAP transition on the Glassmorphic entrance mask
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        y: -50,
        scale: 0.98,
        duration: 0.85,
        ease: "power3.out",
        onComplete: () => {
          if (overlayRef.current) {
            overlayRef.current.style.display = "none";
          }
        },
      });
    }
  };

  // Setup GSAP ScrollTrigger timeline to bind scroll actions smoothly
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!scrollTrackRef.current) return;

      scrollTriggerInstance.current = ScrollTrigger.create({
        trigger: scrollTrackRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2, // Fluid momentum matching physical drag
        onUpdate: (self) => {
          const currentProgress = self.progress;
          setScrollProgress(currentProgress);

          // Update audio engines with fine-tuned pitch & filter mappings
          if (audioEngineRef.current && audioEngineRef.current.isUnlocked) {
            audioEngineRef.current.updateScrollProgress(currentProgress);
          }

          // Deterministic color & style state inversion event threshold (55%)
          const threshold = 0.55;
          const passedThreshold = currentProgress >= threshold;
          const previouslyPassed = lastProgressRef.current >= threshold;

          // Downward Breach Event Trigger
          if (passedThreshold && !previouslyPassed) {
            setIsInverted(true);
            if (audioEngineRef.current && audioEngineRef.current.isUnlocked) {
              audioEngineRef.current.pop();
            }
          }
          // Upward Re-entry/Re-Invert Event Trigger
          else if (!passedThreshold && previouslyPassed) {
            setIsInverted(false);
          }

          lastProgressRef.current = currentProgress;
        }
      });
    });

    return () => {
      // Unmount garbage collection
      ctx.revert();
      if (scrollTriggerInstance.current) {
        scrollTriggerInstance.current.kill();
      }
    };
  }, []);

  return (
    <div 
      className={`relative w-full ${
        isInverted ? "bg-[#F8F9FA] text-[#0A0A0C]" : "bg-[#000000] text-[#E2E0E6]"
      } transition-colors duration-700 ease-out`}
    >
      {/* 1. System Glassmorphic Permission Doorway Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 flex flex-col items-center justify-center bg-[#000000]/95 backdrop-blur-xl z-[999] px-4 md:px-6 text-center select-none overflow-y-auto py-8"
      >
        <div className="absolute top-6 left-6 md:top-12 md:left-12 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-purple-500 animate-pulse" />
          <span className="font-mono text-[10px] md:text-xs tracking-wider text-purple-400 font-semibold">
            SYS PORTAL CORE // PORT 3000
          </span>
        </div>

        <div className="max-w-2xl flex flex-col items-center my-auto">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.35)] mb-6 md:mb-10 animate-bounce mt-8 md:mt-4">
            <Volume2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white mb-4 md:mb-6 leading-tight">
            The <span className="text-neon-purple font-semibold">Liquid Ink</span> Portal
          </h2>

          <p className="font-sans text-xs md:text-sm lg:text-base text-gray-400 leading-relaxed max-w-lg mb-8 md:mb-10">
            Welcome to an elite spatial interactive system sandbox environment. We synthesize high-fidelity physical glass modeling and hydro-acoustic drone frequencies directly inside your Web Audio namespace.
          </p>

          <button
            onClick={handleUnlockAudio}
            id="enter-system-btn"
            className="group relative flex items-center gap-3 bg-neon-purple hover:bg-purple-600 text-white font-mono text-xs tracking-widest uppercase font-semibold px-6 py-3.5 md:px-8 md:py-4 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_45px_rgba(168,85,247,0.65)] transform active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
            ENTER SYSTEM CORRIDOR
          </button>
        </div>

        <div className="absolute bottom-6 md:bottom-12 text-center px-4">
          <span className="font-mono text-[9px] text-zinc-600 tracking-wider">
            CREATIVE WEBGL PIPELINE • REDISCOVER SYNTHESIS MODELING V2.6
          </span>
        </div>
      </div>

      {/* VERTICAL RAIL TEXT FROM BOLD TYPOGRAPHY DESIGN THEME - HIDDEN ON PORTRAIT OR MOBILE SCREEN WIDTHS */}
      {isUnlocked && (
        <div 
          className={`fixed left-4 md:left-8 top-1/2 -translate-y-1/2 [writing-mode:vertical-rl] rotate-180 hidden md:flex gap-8 text-[9px] tracking-[0.45em] font-mono font-bold uppercase transition-colors duration-500 ease-out select-none z-35 ${
            isInverted ? "text-[#0A0A0C]/40" : "text-purple-400/50"
          }`}
        >
          <span>Scroll Depth: {Math.round(scrollProgress * 100)}%</span>
          <span>Surface Tension: {isInverted ? "Broken" : "Sealed"}</span>
        </div>
      )}

      {/* 2. Scroll Space Track container (600vh scroll volume) */}
      <div 
        ref={scrollTrackRef} 
        id="scroll-track" 
        className="relative w-full h-[600vh]"
      >
        {/* Fixed WebGL Layer capturing viewport container */}
        <div className="fixed inset-0 w-full h-screen z-10 pointer-events-none">
          <LiquidBlobCanvas scrollProgress={scrollProgress} isInverted={isInverted} />
        </div>

        {/* 3. Pre-breach scroll helper indicator */}
        {!isInverted && scrollProgress < 0.12 && isUnlocked && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-center z-30 pointer-events-none animate-bounce">
            <span className="font-mono text-[9px] text-purple-400 tracking-widest font-semibold">
              SCROLL SLOWLY TO COMMENCE EXPLORATION
            </span>
            <ChevronDown className="w-4 h-4 text-purple-400" />
          </div>
        )}

        {/* 4. Active Interactive Layout Modules */}
        <div className="relative w-full z-20">
          {/* Spacer to push showroom context to exact phase coordinate boundary */}
          <div className="h-[260vh] w-full flex items-center justify-center pointer-events-none" />

          {/* Core showroom portal page layout wrapper */}
          <div className="w-full min-h-[340vh] pb-24 relative z-30 pointer-events-auto">
            <Showroom scrollProgress={scrollProgress} isInverted={isInverted} />
          </div>
        </div>
      </div>
    </div>
  );
}
