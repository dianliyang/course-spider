"use client";

import { useState } from "react";
import Image from "next/image";
import { getUniversityLogoUrl } from "@/lib/supabase/storage";

interface UniversityIconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function UniversityIcon({ name, size = 40, className = "" }: UniversityIconProps) {
  const [error, setError] = useState(false);
  const logoUrl = getUniversityLogoUrl(name);

  // Generate initials for fallback
  // "University of California" -> "UC"
  // "MIT" -> "MIT"
  // "San Jose State" -> "SJ"
  const getInitials = (str: string) => {
    // If it's already an acronym (uppercase), return it
    if (str === str.toUpperCase() && str.length <= 4) return str;
    
    // Otherwise take first letters of first 2-3 words
    const words = str.split(' ').filter(w => w.length > 0);
    if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
    return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  };

  if (error) {
    return (
      <div 
        className={`bg-gray-100 text-gray-500 font-black flex items-center justify-center uppercase select-none rounded-lg ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(8, size * 0.35) }}
        title={name}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        width={size}
        height={size}
        className="object-contain w-full h-full"
        onError={() => setError(true)}
      />
    </div>
  );
}
