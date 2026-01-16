"use client";

import { useState } from "react";
import Image from "next/image";
import { Course } from "@/types";

interface ActiveCourseTrackProps {
  course: Course;
  initialProgress: number;
  onUpdate?: () => void;
  dict?: any;
}

export default function ActiveCourseTrack({ course, initialProgress, onUpdate, dict }: ActiveCourseTrackProps) {
  const [progress, setProgress] = useState(initialProgress);
  const [isUpdating, setIsInUpdating] = useState(false);

  const logos: Record<string, string> = {
    mit: "/mit.svg", stanford: "/stanford.jpg", cmu: "/cmu.jpg", ucb: "/ucb.png",
  };

  const handleProgressChange = async (newProgress: number) => {
    const validatedProgress = Math.min(100, Math.max(0, newProgress));
    setProgress(validatedProgress);
    setIsInUpdating(true);
    try {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          action: "update_progress",
          progress: validatedProgress
        })
      });
      if (res.ok) onUpdate?.();
    } catch (e) {
      console.error("Failed to update progress:", e);
    } finally {
      setIsInUpdating(false);
    }
  };

  const quickIncrements = [10, 25, 50, 75];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-6 group hover:border-brand-blue/30 transition-all hover:shadow-xl hover:shadow-brand-blue/5">
      {/* Top Section: Title & Logo */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-10 h-10 relative flex-shrink-0 bg-gray-50 rounded-xl p-1.5 border border-gray-100">
            {logos[course.university] ? (
              <Image src={logos[course.university]} alt={course.university} fill className="object-contain p-1" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-gray-400 text-xs uppercase">{course.university.substring(0, 1)}</div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] leading-none">{course.university}</span>
              <span className="text-[10px] font-bold text-gray-400 font-mono">{course.courseCode}</span>
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight group-hover:text-brand-blue transition-colors line-clamp-1">
              {course.title}
            </h3>
          </div>
        </div>
        
        <a 
          href={course.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-brand-blue hover:bg-blue-50 transition-all cursor-pointer border border-transparent hover:border-brand-blue/20 flex-shrink-0"
          title={dict?.go_to_course || "Go to Course"}
        >
          <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
        </a>
      </div>

      {/* Middle Section: Progress Bar (Slimmer) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Learning Progress</span>
          <span className={`text-sm font-black italic tracking-tighter transition-colors ${isUpdating ? 'text-brand-blue animate-pulse' : 'text-gray-900'}`}>
            {progress}%
          </span>
        </div>
        <div className="relative h-4 flex items-center">
          {/* Background Track */}
          <div className="absolute inset-0 bg-gray-50 rounded-full h-1.5 my-auto"></div>
          {/* Visual Digital Ticks */}
          <div className="flex gap-[2px] items-center w-full relative z-0">
            {Array.from({ length: 50 }).map((_, i) => {
              const isActive = (i / 50) < (progress / 100);
              return (
                <div 
                  key={i} 
                  className={`flex-grow h-1.5 rounded-full transition-all duration-500 ${
                    isActive 
                      ? 'bg-brand-blue shadow-[0_0_8px_rgba(59,130,246,0.4)]' 
                      : 'bg-transparent'
                  } ${isActive && isUpdating ? 'animate-pulse' : ''}`}
                ></div>
              );
            })}
          </div>
          
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value))}
            onMouseUp={(e) => handleProgressChange(parseInt((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleProgressChange(parseInt((e.target as HTMLInputElement).value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
      </div>

      {/* Bottom Section: Quick Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
        <div className="flex gap-1.5">
          {quickIncrements.map((inc) => (
            <button
              key={inc}
              onClick={() => handleProgressChange(inc)}
              disabled={isUpdating}
              className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border transition-all ${
                progress === inc 
                  ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20' 
                  : 'bg-white text-gray-400 border-gray-100 hover:border-brand-blue/30 hover:text-brand-blue'
              }`}
            >
              {inc}%
            </button>
          ))}
        </div>
        <div className="w-px h-4 bg-gray-100 mx-2"></div>
        <button
          onClick={() => handleProgressChange(100)}
          disabled={isUpdating || progress === 100}
          className="flex-grow text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-brand-green/20 text-brand-green bg-brand-green/5 hover:bg-brand-green hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-check text-[8px]"></i>
          {dict?.mark_complete || "Complete"}
        </button>
      </div>
    </div>
  );
}
