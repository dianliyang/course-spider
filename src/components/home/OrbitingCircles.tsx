"use client";

import { useEffect, useRef } from "react";

export default function OrbitingCircles() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      {/* Orbits */}
      <div className="absolute w-[40%] h-[40%] border border-slate-200 rounded-full opacity-60"></div>
      <div className="absolute w-[70%] h-[70%] border border-slate-200 rounded-full opacity-40"></div>
      <div className="absolute w-[100%] h-[100%] border border-slate-100 rounded-full opacity-30"></div>

      {/* Center Core */}
      <div className="absolute w-12 h-12 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center z-10">
        <div className="w-3 h-3 bg-brand-blue rounded-full animate-pulse"></div>
      </div>

      {/* Orbiting Nodes - Ring 1 */}
      <div className="absolute w-[40%] h-[40%] animate-spin-slow">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center">
           <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center">
           <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
        </div>
      </div>

      {/* Orbiting Nodes - Ring 2 (Reverse) */}
      <div className="absolute w-[70%] h-[70%] animate-spin-reverse-slower">
        <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center">
           <i className="fa-solid fa-graduation-cap text-slate-400 text-[10px]"></i>
        </div>
        <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center">
           <i className="fa-solid fa-code text-slate-400 text-[10px]"></i>
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center">
           <i className="fa-solid fa-database text-slate-400 text-[10px]"></i>
        </div>
      </div>
    </div>
  );
}
