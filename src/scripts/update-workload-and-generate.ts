// Script to regenerate study schedule with round-robin rotation and max 2 per course per week
// Run with: npx tsx -r dotenv/config src/scripts/update-workload-and-generate.ts dotenv_config_path=.env.local

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function updateWorkloadAndGenerate() {
  console.log('🔍 Finding in-progress courses...');
  
  // Get all in-progress user_courses with their course info
  const { data: userCourses, error: fetchError } = await supabase
    .from('user_courses')
    .select(`
      user_id,
      course_id,
      courses(id, title, workload)
    `)
    .eq('status', 'in_progress');

  if (fetchError) {
    console.error('Error fetching courses:', fetchError);
    return;
  }

  if (!userCourses || userCourses.length === 0) {
    console.log('❌ No in-progress courses found');
    return;
  }

  console.log(`📚 Found ${userCourses.length} in-progress course enrollments`);

  // Get unique course IDs
  const courseIds = [...new Set(userCourses.map(uc => uc.course_id))];

  // Now generate schedules for each user
  const userIds = [...new Set(userCourses.map(uc => uc.user_id))];
  console.log(`\n📅 Generating schedules for ${userIds.length} user(s)...`);

  for (const userId of userIds) {
    // Delete existing future schedules
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    await supabase
      .from('study_schedules')
      .delete()
      .eq('user_id', userId)
      .gte('scheduled_date', todayStr);

    // Get this user's in-progress courses with workload
    const userInProgress = userCourses.filter(uc => uc.user_id === userId);
    
    // Constants
    const DEFAULT_SESSIONS = 20;
    const SESSION_DURATION_MINUTES = 120;
    const MAX_COURSES_PER_DAY = 2;
    const MAX_SESSIONS_PER_COURSE_PER_WEEK = 2;

    interface CourseSession {
      courseId: number;
      sessionsRemaining: number;
      sessionsThisWeek: number;
    }

    const courseSessions: CourseSession[] = userInProgress.map(uc => {
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

    console.log(`📝 Courses for user ${userId.substring(0, 8)}...:`);
    courseSessions.forEach(cs => {
      const course = userInProgress.find(uc => uc.course_id === cs.courseId)?.courses as { title?: string } | null;
      console.log(`   - ${course?.title || 'Unknown'}: ${cs.sessionsRemaining} sessions`);
    });

    const scheduleEntries: any[] = [];
    let dayOffset = 0;
    let currentCourseIndex = 0;
    let currentWeekStart = 0;

    while (courseSessions.some(cs => cs.sessionsRemaining > 0) && dayOffset < 365) {
      const studyDate = new Date(today);
      studyDate.setDate(today.getDate() + dayOffset);
      const dateStr = studyDate.toISOString().split('T')[0];

      // Check for new week
      if (dayOffset >= currentWeekStart + 7) {
        currentWeekStart = dayOffset;
        courseSessions.forEach(cs => cs.sessionsThisWeek = 0);
      }

      let scheduledToday = 0;
      const startIndex = currentCourseIndex;
      let checkedAll = false;

      while (scheduledToday < MAX_COURSES_PER_DAY && !checkedAll) {
        const course = courseSessions[currentCourseIndex];

        if (course.sessionsRemaining > 0 && course.sessionsThisWeek < MAX_SESSIONS_PER_COURSE_PER_WEEK) {
          scheduleEntries.push({
            user_id: userId,
            course_id: course.courseId,
            scheduled_date: dateStr,
            is_completed: false,
            duration_minutes: SESSION_DURATION_MINUTES,
            notes: null
          });
          course.sessionsRemaining--;
          course.sessionsThisWeek++;
          scheduledToday++;
        }

        currentCourseIndex = (currentCourseIndex + 1) % courseSessions.length;
        if (currentCourseIndex === startIndex) {
          checkedAll = true;
        }
      }

      // Alternating: study day, rest day
      dayOffset += 2;
    }

    // Insert schedules
    if (scheduleEntries.length > 0) {
      const { error: insertError } = await supabase
        .from('study_schedules')
        .insert(scheduleEntries);

      if (insertError) {
        console.error(`Error inserting schedules for user ${userId}:`, insertError);
      } else {
        console.log(`\n✅ Generated ${scheduleEntries.length} study sessions`);
        console.log(`   Pattern: Round-robin, max 2 courses/day, max 2 sessions/course/week`);
      }
    }
  }

  console.log('\n🎉 Done! Schedule generation complete.');
}

updateWorkloadAndGenerate().catch(console.error);
