"use client";

import { useEffect, useState } from "react";

export default function FloatingNavWrapper({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`sticky top-0 z-50 transition-all duration-500 ease-out flex justify-center w-full pointer-events-none ${
      scrolled ? 'pt-4 pb-4' : 'pt-0 pb-0'
    }`}>
      <div className={`transition-all duration-500 ease-out pointer-events-auto ${
        scrolled 
          ? 'w-[90%] max-w-5xl rounded-2xl shadow-2xl shadow-gray-200/40 border border-white/60 bg-white/80 backdrop-blur-xl translate-y-0' 
          : 'w-full border-b border-gray-100 bg-white/90 backdrop-blur-md translate-y-0'
      }`}>
        {children}
      </div>
    </div>
  );
}
