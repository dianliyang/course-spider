"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks() {
  const pathname = usePathname();
  const navLinks = [
    { name: "Courses", href: "/courses" },
    { name: "Study Roadmap", href: "/study-plan" },
    { name: "My Profile", href: "/profile" }
  ];

  return (
    <div className="hidden lg:flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-full border border-gray-200/50">
      {navLinks.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className={`relative px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center ${
              isActive 
                ? 'bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            {item.name}
            {isActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-blue rounded-full opacity-0"></span>
            )}
          </Link>
        );
      })}
    </div>
  );
}