"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface SemesterFilterProps {
  availableSemesters: string[];
  selectedSemester: string;
}

export default function SemesterFilter({ availableSemesters, selectedSemester }: SemesterFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("semester");
    } else {
      params.set("semester", value);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative group min-w-[180px]">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <i className="fa-solid fa-calendar-day text-[10px] text-gray-400 group-hover:text-brand-green transition-colors"></i>
      </div>
      <select
        value={selectedSemester}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-100 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-xl focus:ring-brand-green focus:border-brand-green block p-2.5 pl-9 appearance-none cursor-pointer transition-all hover:border-gray-200"
      >
        <option value="all">All Eras</option>
        {availableSemesters.map((sem) => (
          <option key={sem} value={sem}>
            {sem}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <i className="fa-solid fa-chevron-down text-[8px] text-gray-400"></i>
      </div>
    </div>
  );
}
