"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks({ 
  variant = "light", 
  collapsed = false,
  dict,
  mode = "dashboard"
}: { 
  variant?: "light" | "dark", 
  collapsed?: boolean,
  dict?: any,
  mode?: "landing" | "dashboard"
}) {
  const pathname = usePathname();
  
  const landingLinks = [
    { name: dict?.mission || "Mission", href: "#mission", icon: "fa-solid fa-circle-info" },
    { name: dict?.universities || "Nodes", href: "#universities", icon: "fa-solid fa-diagram-project" },
    { name: dict?.curriculum || "Protocol", href: "#features", icon: "fa-solid fa-layer-group" },
    { name: dict?.pricing || "Pricing", href: "#pricing", icon: "fa-solid fa-tag" }
  ];

  const dashboardLinks = [
    { name: "Courses", href: "/courses", icon: "fa-solid fa-book-open" },
    { name: "Study Roadmap", href: "/study-plan", icon: "fa-solid fa-map-location-dot" },
    { name: "My Profile", href: "/profile", icon: "fa-solid fa-user-gear" }
  ];

  const navLinks = mode === "landing" ? landingLinks : dashboardLinks;
  const isDark = variant === "dark";

  return (
    <div className={`hidden lg:flex items-center transition-all duration-500 ${
      collapsed 
        ? 'gap-3 bg-transparent border-none' 
        : `gap-2 p-1.5 rounded-full border ${isDark ? 'bg-black/40 border-white/5 shadow-2xl' : 'bg-gray-50 border-slate-200/60'}`
    }`}>
      {navLinks.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className={`group relative flex items-center justify-center transition-all duration-500 ${
              collapsed 
                ? 'w-10 h-10 rounded-full hover:bg-white/10 text-gray-400 hover:text-white' 
                : `px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] gap-2.5 ${
                    isActive 
                      ? (isDark ? 'bg-white text-gray-950 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-slate-900 text-white shadow-lg shadow-slate-200') 
                      : (isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-white')
                  }`
            }`}
            title={collapsed ? item.name : undefined}
          >
            <i className={`${item.icon} text-[13px] transition-all duration-500 ${
              isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'
            }`}></i>
            
            <span className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${
              collapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'
            }`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}