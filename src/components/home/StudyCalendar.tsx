"use client";

import { useState, useMemo } from "react";
import { Course } from "@/types";
import Link from "next/link";
import { Dictionary } from "@/lib/dictionary";

interface EnrolledCourse extends Course {
  status: string;
  progress: number;
  updated_at: string;
}

interface StudyCalendarProps {
  courses: EnrolledCourse[];
  dict: Dictionary['dashboard']['roadmap'];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_ZH = ['日', '一', '二', '三', '四', '五', '六'];

export default function StudyCalendar({ courses, dict }: StudyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const isZh = dict.title === '修读路线';
  const weekdays = isZh ? WEEKDAYS_ZH : WEEKDAYS;

  const { year, month, daysInMonth, firstDayOfWeek, today } = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const days = new Date(y, m + 1, 0).getDate();
    const firstDay = new Date(y, m, 1).getDay();
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === y && now.getMonth() === m;
    
    return {
      year: y,
      month: m,
      daysInMonth: days,
      firstDayOfWeek: firstDay,
      today: isCurrentMonth ? now.getDate() : null,
    };
  }, [currentDate]);

  // Group courses by date
  const coursesByDate = useMemo(() => {
    const map = new Map<number, EnrolledCourse[]>();
    
    courses.forEach(course => {
      const date = new Date(course.updated_at);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const day = date.getDate();
        const existing = map.get(day) || [];
        existing.push(course);
        map.set(day, existing);
      }
    });
    
    return map;
  }, [courses, year, month]);

  const monthNames = isZh 
    ? ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
    setSelectedDay(null);
  };

  const selectedDayCourses = selectedDay ? coursesByDate.get(selectedDay) || [] : [];

  // Generate calendar grid
  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-violet-500/30 transition-all hover:shadow-xl hover:shadow-violet-500/5">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-1">
            {dict.calendar_title || "Study Schedule"}
          </span>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">
            {monthNames[month]} <span className="text-violet-500">{year}</span>
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigateMonth(-1)}
            className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-violet-500 hover:bg-violet-50 transition-all border border-transparent hover:border-violet-500/20"
          >
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-violet-500 bg-violet-50 rounded-lg hover:bg-violet-500 hover:text-white transition-all"
          >
            {dict.calendar_today || "Today"}
          </button>
          <button 
            onClick={() => navigateMonth(1)}
            className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-violet-500 hover:bg-violet-50 transition-all border border-transparent hover:border-violet-500/20"
          >
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day, i) => (
          <div 
            key={day} 
            className={`text-center text-[9px] font-black uppercase tracking-widest py-2 ${
              i === 0 || i === 6 ? 'text-gray-300' : 'text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square"></div>;
          }
          
          const dayCourses = coursesByDate.get(day) || [];
          const hasEvents = dayCourses.length > 0;
          const isToday = day === today;
          const isSelected = day === selectedDay;
          const isWeekend = (index % 7 === 0) || (index % 7 === 6);

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all group ${
                isSelected 
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30 scale-105' 
                  : isToday 
                    ? 'bg-violet-50 text-violet-600 ring-2 ring-violet-500/30'
                    : hasEvents
                      ? 'bg-gray-50 hover:bg-violet-50 text-gray-900'
                      : isWeekend
                        ? 'text-gray-300 hover:bg-gray-50'
                        : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className={`text-sm font-black ${isToday && !isSelected ? 'text-violet-600' : ''}`}>
                {day}
              </span>
              
              {hasEvents && (
                <div className="flex gap-0.5 mt-1">
                  {dayCourses.slice(0, 3).map((course, i) => (
                    <div 
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected 
                          ? 'bg-white/70' 
                          : course.status === 'completed' 
                            ? 'bg-brand-green' 
                            : 'bg-brand-blue'
                      }`}
                    ></div>
                  ))}
                  {dayCourses.length > 3 && (
                    <span className={`text-[8px] font-bold ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                      +{dayCourses.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Events */}
      {selectedDay && (
        <div className="mt-6 pt-6 border-t border-gray-100 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              {dict.calendar_events || "Scheduled Activities"} — {monthNames[month]} {selectedDay}
            </span>
            <span className="text-[10px] font-bold text-violet-500 bg-violet-50 px-2 py-1 rounded-full">
              {selectedDayCourses.length} {selectedDayCourses.length === 1 ? 'course' : 'courses'}
            </span>
          </div>
          
          {selectedDayCourses.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedDayCourses.map(course => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-violet-50 transition-all group/item"
                >
                  <div className={`w-2 h-8 rounded-full flex-shrink-0 ${
                    course.status === 'completed' ? 'bg-brand-green' : 'bg-brand-blue'
                  }`}></div>
                  <div className="min-w-0 flex-grow">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover/item:text-violet-600 transition-colors">
                      {course.title}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">
                      {course.university} • {course.courseCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                      course.status === 'completed' 
                        ? 'bg-brand-green/10 text-brand-green' 
                        : 'bg-brand-blue/10 text-brand-blue'
                    }`}>
                      {course.progress}%
                    </span>
                    <i className="fa-solid fa-arrow-right text-[10px] text-gray-300 group-hover/item:text-violet-500 transition-colors"></i>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 font-mono italic text-center py-4">
              {dict.calendar_no_events || "No activities scheduled"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
