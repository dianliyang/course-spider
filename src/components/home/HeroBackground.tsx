"use client";

import { useEffect, useRef } from "react";

export default function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        container.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        container.style.setProperty("--my", `${e.clientY - rect.top}px`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-slate-50" style={{ "--mx": "0px", "--my": "0px" } as React.CSSProperties}>
      {/* Dynamic Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background: `radial-gradient(800px circle at var(--mx) var(--my), rgba(59, 130, 246, 0.08), transparent 40%)`
        }}
      />

      {/* Modern Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>

      {/* Floating Data Fragments */}
      {[
        { top: '15%', left: '10%', text: 'CS50', delay: '0s' },
        { top: '25%', right: '15%', text: 'MIT 6.001', delay: '2s' },
        { bottom: '20%', left: '20%', text: 'Dijkstra', delay: '4s' },
        { top: '40%', left: '50%', text: 'O(n log n)', delay: '1s', blur: true },
      ].map((item, i) => (
        <div
          key={i}
          className={`absolute bg-white/40 backdrop-blur-md border border-slate-200 shadow-sm px-4 py-2 rounded-lg text-xs font-mono text-brand-blue animate-[float-random_10s_ease-in-out_infinite] ${item.blur ? 'blur-[1px] opacity-40' : 'opacity-80'}`}
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
            animationDelay: item.delay
          }}
        >
          {item.text}
        </div>
      ))}

      {/* Subtle Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.5)_50%)] bg-[size:100%_4px] opacity-[0.03]"></div>
    </div>
  );
}
