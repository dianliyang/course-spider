import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getUser, createClient } from '@/lib/supabase/server';

interface ScheduleRequest {
  action: 'generate' | 'add' | 'remove' | 'toggle_complete' | 'get';
  courseId?: number;
  date?: string; // ISO date string
  durationMinutes?: number;
  notes?: string;
}

interface ScheduleEntry {
  course_id: number;
  scheduled_date: string;
  is_completed: boolean;
  duration_minutes: number;
  notes: string | null;
}

export async function POST(request: Request) {
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  try {
    const body = await request.json() as ScheduleRequest;
    const { action } = body;
    
    console.log(`[Schedule API] Processing action: ${action} for user ${userId}`);

    const supabase = await createClient();

    // Generate study plan for in-progress courses
    if (action === 'generate') {
      // Get all in-progress courses with their workload from courses table
      const { data: userCourses, error: fetchError } = await supabase
        .from('user_courses')
        .select(`
          course_id,
          courses(id, workload)
        `)
        .eq('user_id', userId)
        .eq('status', 'in_progress');

      if (fetchError) throw fetchError;

      if (!userCourses || userCourses.length === 0) {
        return NextResponse.json({ success: true, message: "No in-progress courses to schedule", count: 0 });
      }

      // Delete existing future schedules for this user
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      await supabase
        .from('study_schedules')
        .delete()
        .eq('user_id', userId)
        .gte('scheduled_date', todayStr);

      // Constants for schedule generation
      const DEFAULT_SESSIONS = 20; // Default if workload not specified
      const SESSION_DURATION_MINUTES = 120; // Each study session is 2 hours
      const MAX_COURSES_PER_DAY = 2;
      const MAX_SESSIONS_PER_COURSE_PER_WEEK = 2; // Each course at most 2 times per week
      const MAX_SCHEDULE_DAYS = 365;

      // Create sessions for each course based on workload field
      interface CourseSession {
        courseId: number;
        sessionsRemaining: number;
        sessionsThisWeek: number;
      }

      const courseSessions: CourseSession[] = userCourses.map((uc: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        // Get sessions from course workload field (workload = number of sessions)
        let sessions = DEFAULT_SESSIONS;
        const course = uc.courses as { workload?: string } | null;
        if (course?.workload) {
          const parsed = parseInt(course.workload);
          if (!isNaN(parsed) && parsed > 0) {
            sessions = parsed;
          }
        }
        return {
          courseId: uc.course_id,
          sessionsRemaining: sessions,
          sessionsThisWeek: 0
        };
      });

      const scheduleEntries: ScheduleEntry[] = [];
      let dayOffset = 0;
      let currentCourseIndex = 0; // For round-robin rotation
      let currentWeekStart = 0; // Track week boundaries

      while (courseSessions.some(cs => cs.sessionsRemaining > 0) && dayOffset < MAX_SCHEDULE_DAYS) {
        const studyDate = new Date(today);
        studyDate.setDate(today.getDate() + dayOffset);
        const dateStr = studyDate.toISOString().split('T')[0];

        // Check if we've entered a new week (every 7 days from start)
        if (dayOffset >= currentWeekStart + 7) {
          currentWeekStart = dayOffset;
          // Reset weekly counters
          courseSessions.forEach(cs => cs.sessionsThisWeek = 0);
        }

        let coursesScheduledToday = 0;

        // Round-robin through courses
        const startIndex = currentCourseIndex;
        let checkedAll = false;

        while (coursesScheduledToday < MAX_COURSES_PER_DAY && !checkedAll) {
          const course = courseSessions[currentCourseIndex];

          // Check if this course can be scheduled
          if (course.sessionsRemaining > 0 && course.sessionsThisWeek < MAX_SESSIONS_PER_COURSE_PER_WEEK) {
            scheduleEntries.push({
              course_id: course.courseId,
              scheduled_date: dateStr,
              is_completed: false,
              duration_minutes: SESSION_DURATION_MINUTES,
              notes: null
            });
            course.sessionsRemaining--;
            course.sessionsThisWeek++;
            coursesScheduledToday++;
          }

          // Move to next course (round-robin)
          currentCourseIndex = (currentCourseIndex + 1) % courseSessions.length;

          // Check if we've gone through all courses
          if (currentCourseIndex === startIndex) {
            checkedAll = true;
          }
        }

        // Skip next day (rest day) - alternating pattern
        dayOffset += 2;
      }

      // Insert all schedule entries
      if (scheduleEntries.length > 0) {
        const { error: insertError } = await supabase
          .from('study_schedules')
          .insert(scheduleEntries.map(entry => ({
            user_id: userId,
            ...entry
          })));

        if (insertError) throw insertError;
      }

      revalidatePath('/study-plan');
      return NextResponse.json({ 
        success: true, 
        message: `Generated schedule for ${userCourses.length} courses`,
        count: scheduleEntries.length
      });
    }

    // Get all schedules for user
    if (action === 'get') {
      const { data: schedules, error: fetchError } = await supabase
        .from('study_schedules')
        .select(`
          id,
          course_id,
          scheduled_date,
          is_completed,
          duration_minutes,
          notes,
          courses(id, title, course_code, university)
        `)
        .eq('user_id', userId)
        .order('scheduled_date', { ascending: true });

      if (fetchError) throw fetchError;

      return NextResponse.json({ success: true, schedules: schedules || [] });
    }

    // Add a single schedule entry
    if (action === 'add') {
      const { courseId, date, durationMinutes = 60, notes } = body;
      
      if (!courseId || !date) {
        return NextResponse.json({ error: "courseId and date are required" }, { status: 400 });
      }

      const { error } = await supabase
        .from('study_schedules')
        .upsert({
          user_id: userId,
          course_id: courseId,
          scheduled_date: date,
          duration_minutes: durationMinutes,
          notes: notes || null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      revalidatePath('/study-plan');
      return NextResponse.json({ success: true, message: "Schedule added" });
    }

    // Remove a schedule entry
    if (action === 'remove') {
      const { courseId, date } = body;
      
      if (!courseId || !date) {
        return NextResponse.json({ error: "courseId and date are required" }, { status: 400 });
      }

      const { error } = await supabase
        .from('study_schedules')
        .delete()
        .match({ user_id: userId, course_id: courseId, scheduled_date: date });

      if (error) throw error;
      revalidatePath('/study-plan');
      return NextResponse.json({ success: true, message: "Schedule removed" });
    }

    // Toggle completion status
    if (action === 'toggle_complete') {
      const { courseId, date } = body;
      
      if (!courseId || !date) {
        return NextResponse.json({ error: "courseId and date are required" }, { status: 400 });
      }

      // First get current status
      const { data: current, error: fetchError } = await supabase
        .from('study_schedules')
        .select('is_completed')
        .match({ user_id: userId, course_id: courseId, scheduled_date: date })
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('study_schedules')
        .update({ 
          is_completed: !current?.is_completed,
          updated_at: new Date().toISOString()
        })
        .match({ user_id: userId, course_id: courseId, scheduled_date: date });

      if (error) throw error;
      revalidatePath('/study-plan');
      return NextResponse.json({ success: true, message: "Completion toggled" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Schedule error:", error);
    return NextResponse.json({ error: "Failed to process schedule" }, { status: 500 });
  }
}

// GET method for fetching schedules
export async function GET() {
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    
    const { data: schedules, error } = await supabase
      .from('study_schedules')
      .select(`
        id,
        course_id,
        scheduled_date,
        is_completed,
        duration_minutes,
        notes,
        courses(id, title, course_code, university)
      `)
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, schedules: schedules || [] });
  } catch (error) {
    console.error("Schedule fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}
