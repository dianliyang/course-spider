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
    <div className="hidden lg:flex items-center gap-10">
      {navLinks.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.name} href={item.href} className="group flex flex-col items-center">
            <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
              isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-900'
            }`}>
              {item.name}
            </span>
            <div className={`h-0.5 bg-brand-blue mt-1 transition-all duration-300 rounded-full ${
              isActive ? 'w-4' : 'w-0 group-hover:w-4'
            }`}></div>
          </Link>
        );
      })}
    </div>
  );
}
