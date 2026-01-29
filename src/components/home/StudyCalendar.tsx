"use client";

import { useState, useMemo } from "react";
import { Course } from "@/types";
import Link from "next/link";
import { Dictionary } from "@/lib/dictionary";
import { useRouter } from "next/navigation";

interface EnrolledCourse extends Course {
  status: string;
  progress: number;
  updated_at: string;
}

interface ScheduleEntry {
  courseId: number;
  date: string;
  isCompleted: boolean;
  durationMinutes: number;
  course: {
    id: number;
    title: string;
    courseCode: string;
    university: string;
  } | null;
}

interface StudyCalendarProps {
  courses: EnrolledCourse[];
  schedules: ScheduleEntry[];
  dict: Dictionary['dashboard']['roadmap'];
}

export default function StudyCalendar({ courses, schedules, dict }: StudyCalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Get weekdays and months from dictionary (with fallbacks)
  const weekdays = (dict.calendar_weekdays as string[] | undefined) || ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthNames = (dict.calendar_months as string[] | undefined) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

  // Group schedules by date (from database)
  const schedulesByDate = useMemo(() => {
    const map = new Map<number, ScheduleEntry[]>();
    
    schedules.forEach(schedule => {
      const date = new Date(schedule.date);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const day = date.getDate();
        const existing = map.get(day) || [];
        existing.push(schedule);
        map.set(day, existing);
      }
    });
    
    return map;
  }, [schedules, year, month]);

  // Group past activity by date (from enrolled courses)
  const activityByDate = useMemo(() => {
    const map = new Map<number, EnrolledCourse[]>();
    
    courses.forEach(course => {
      const date = new Date(course.updated_at);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const day = date.getDate();
        if (today && day < today) {
          const existing = map.get(day) || [];
          existing.push(course);
          map.set(day, existing);
        }
      }
    });
    
    return map;
  }, [courses, year, month, today]);

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
    setSelectedDay(null);
  };

  const generateSchedule = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' })
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error('Failed to generate schedule:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Get data for selected day
  const selectedDaySchedules = selectedDay ? schedulesByDate.get(selectedDay) || [] : [];
  const selectedDayActivity = selectedDay ? activityByDate.get(selectedDay) || [] : [];
  const isSelectedDayScheduled = selectedDay && selectedDaySchedules.length > 0;
  const isSelectedDayFuture = selectedDay && today ? selectedDay >= today : false;
  const isSelectedDayRest = isSelectedDayFuture && selectedDaySchedules.length === 0;

  // Check if there are in-progress courses but no schedules
  const inProgressCourses = courses.filter(c => c.status === 'in_progress');
  const hasSchedules = schedules.length > 0;
  const needsScheduleGeneration = inProgressCourses.length > 0 && !hasSchedules;

  // Generate calendar grid
  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-violet-500/30 transition-all hover:shadow-xl hover:shadow-violet-500/5">
      <div className="flex gap-4">
        {/* Left: Calendar */}
        <div className="flex-shrink-0 w-64">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-gray-900 tracking-tight">
              {monthNames[month]} <span className="text-violet-500">{year}</span>
            </h3>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => navigateMonth(-1)}
                className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-400 hover:text-violet-500 hover:bg-violet-50 transition-all"
              >
                <i className="fa-solid fa-chevron-left text-[10px]"></i>
              </button>
              <button 
                onClick={() => {
                  const now = new Date();
                  setCurrentDate(now);
                  setSelectedDay(now.getDate());
                }}
                className="px-2 py-1 text-[8px] font-black uppercase tracking-widest text-violet-500 bg-violet-50 rounded-md hover:bg-violet-500 hover:text-white transition-all"
              >
                {dict.calendar_today}
              </button>
              <button 
                onClick={() => navigateMonth(1)}
                className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-400 hover:text-violet-500 hover:bg-violet-50 transition-all"
              >
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>

          {/* Generate Button */}
          {needsScheduleGeneration && (
            <button
              onClick={generateSchedule}
              disabled={isGenerating}
              className="w-full mb-3 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white bg-violet-500 rounded-lg hover:bg-violet-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  {dict.calendar_generating}
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  {dict.calendar_generate_plan}
                </>
              )}
            </button>
          )}

          {/* Legend */}
          <div className="flex items-center gap-3 mb-2 text-[8px] font-bold text-gray-400 uppercase tracking-wider">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-violet-500"></div>
              <span>{dict.calendar_study}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-200"></div>
              <span>{dict.calendar_rest}</span>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {weekdays.map((day, i) => (
              <div 
                key={`${day}-${i}`} 
                className={`text-center text-[8px] font-black uppercase tracking-widest py-1 ${
                  i === 0 || i === 6 ? 'text-gray-300' : 'text-gray-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="w-8 h-8"></div>;
              }
              
              const isToday = day === today;
              const isSelected = day === selectedDay;
              const isWeekend = (index % 7 === 0) || (index % 7 === 6);
              const isFuture = today ? day >= today : false;
              const daySchedules = schedulesByDate.get(day) || [];
              const isScheduledStudyDay = daySchedules.length > 0;
              const isRestDay = isFuture && !isScheduledStudyDay && day !== today;
              const pastCourses = activityByDate.get(day) || [];
              const hasPastActivity = pastCourses.length > 0;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center relative transition-all ${
                    isSelected 
                      ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30' 
                      : isToday 
                        ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-500'
                        : isScheduledStudyDay
                          ? 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                          : isRestDay
                            ? 'bg-gray-50 text-gray-300'
                            : hasPastActivity
                              ? 'bg-gray-50 hover:bg-violet-50 text-gray-900'
                              : isWeekend
                                ? 'text-gray-300 hover:bg-gray-50'
                                : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-xs font-bold ${isToday && !isSelected ? 'text-violet-700' : ''}`}>
                    {day}
                  </span>
                  
                  {/* Scheduled study day indicator */}
                  {isScheduledStudyDay && !isSelected && (
                    <div className="absolute bottom-0.5 flex gap-0.5">
                      {daySchedules.slice(0, 2).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-violet-400"></div>
                      ))}
                    </div>
                  )}
                  
                  {/* Past activity indicator */}
                  {hasPastActivity && !isFuture && !isSelected && (
                    <div className="absolute bottom-0.5 flex gap-0.5">
                      {pastCourses.slice(0, 2).map((course, i) => (
                        <div 
                          key={i}
                          className={`w-1 h-1 rounded-full ${
                            course.status === 'completed' ? 'bg-brand-green' : 'bg-brand-blue'
                          }`}
                        ></div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Details */}
        <div className="flex-grow border-l border-gray-100 pl-4 min-w-0">
          {selectedDay ? (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  {monthNames[month]} {selectedDay}
                </span>
                {isSelectedDayScheduled && (
                  <span className="text-[9px] font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">
                    <i className="fa-solid fa-book-open mr-1"></i>
                    {dict.calendar_study_day}
                  </span>
                )}
                {isSelectedDayRest && (
                  <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    <i className="fa-solid fa-moon mr-1"></i>
                    {dict.calendar_rest_day}
                  </span>
                )}
              </div>
              
              {isSelectedDayRest ? (
                <div className="text-center py-6">
                  <i className="fa-solid fa-spa text-gray-200 text-3xl mb-2"></i>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    {dict.calendar_rest_message}
                  </p>
                </div>
              ) : isSelectedDayScheduled ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedDaySchedules.map((schedule, idx) => (
                    schedule.course && (
                      <Link
                        key={`${schedule.courseId}-${idx}`}
                        href={`/courses/${schedule.course.id}`}
                        className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-violet-50 transition-all group/item"
                      >
                        <div className={`w-1.5 h-6 rounded-full flex-shrink-0 ${
                          schedule.isCompleted ? 'bg-brand-green' : 'bg-violet-400'
                        }`}></div>
                        <div className="min-w-0 flex-grow">
                          <p className="text-xs font-bold text-gray-900 truncate group-hover/item:text-violet-600 transition-colors">
                            {schedule.course.title}
                          </p>
                          <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">
                            {schedule.course.university} • {schedule.course.courseCode}
                          </p>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex-shrink-0 ${
                          schedule.isCompleted 
                            ? 'bg-brand-green/10 text-brand-green' 
                            : 'bg-violet-100 text-violet-600'
                        }`}>
                          {schedule.durationMinutes}m
                        </span>
                      </Link>
                    )
                  ))}
                </div>
              ) : selectedDayActivity.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedDayActivity.map(course => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-violet-50 transition-all group/item"
                    >
                      <div className={`w-1.5 h-6 rounded-full flex-shrink-0 ${
                        course.status === 'completed' ? 'bg-brand-green' : 'bg-brand-blue'
                      }`}></div>
                      <div className="min-w-0 flex-grow">
                        <p className="text-xs font-bold text-gray-900 truncate group-hover/item:text-violet-600 transition-colors">
                          {course.title}
                        </p>
                        <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">
                          {course.university} • {course.courseCode}
                        </p>
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex-shrink-0 ${
                        course.status === 'completed' 
                          ? 'bg-brand-green/10 text-brand-green' 
                          : 'bg-brand-blue/10 text-brand-blue'
                      }`}>
                        {course.progress}%
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 font-mono italic py-4">
                  {dict.calendar_no_events}
                </p>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-4">
              <i className="fa-regular fa-calendar-check text-gray-200 text-2xl mb-2"></i>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {dict.calendar_events}
              </p>
              {schedules.length > 0 && (
                <p className="text-[9px] text-violet-400 mt-1">
                  {schedules.length} {dict.calendar_courses_scheduled}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
