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
    <div className="hidden lg:flex items-center gap-1 bg-gray-50/50 p-1.5 rounded-full border border-gray-100/50">
      {navLinks.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className={`relative px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center ${
              isActive 
                ? 'bg-white text-gray-900 shadow-sm shadow-gray-200/50' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
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