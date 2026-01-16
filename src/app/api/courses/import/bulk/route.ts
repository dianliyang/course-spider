import { NextResponse } from 'next/server';
import { createAdminClient, getUser } from '@/lib/supabase/server';
import { ImportRequest } from '@/types';

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access denied" }, { status: 401 });
    }

    const courses = await request.json() as ImportRequest[];
    if (!Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json({ error: "Invalid or empty course list" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    
    // Prepare courses for bulk upsert
    const coursesToUpsert = courses.map(course => ({
      university: course.university,
      course_code: course.courseCode,
      title: course.title,
      description: course.description || "",
      url: course.url || "#",
      level: course.level || "undergraduate",
      is_internal: course.isInternal || (course as any).isInternal || false,
      units: course.units || "",
      department: course.department || "",
      popularity: 0
    }));

    // Perform bulk upsert
    const { data: upsertedCourses, error: upsertError } = await adminSupabase
      .from('courses')
      .upsert(coursesToUpsert, { onConflict: 'university,course_code' })
      .select('id, university, course_code');

    if (upsertError) {
      console.error("Bulk upsert error details:", upsertError);
      throw upsertError;
    }

    // Process semesters and enrollments
    for (const course of courses) {
      const dbCourse = upsertedCourses?.find(c => c.university === course.university && c.course_code === course.courseCode);
      if (!dbCourse) continue;

      // 1. Connect Semester
      const semesterStr = (course as any).semester;
      if (semesterStr) {
        const [yearRange, term] = semesterStr.split(' ');
        const year = parseInt(yearRange.split('-')[0]); // Use start year

        // Upsert semester
        const { data: semData } = await adminSupabase
          .from('semesters')
          .upsert({ year, term }, { onConflict: 'year,term' })
          .select('id')
          .single();

        if (semData) {
          await adminSupabase
            .from('course_semesters')
            .upsert({ course_id: dbCourse.id, semester_id: semData.id }, { onConflict: 'course_id,semester_id' });
        }
      }

      // 2. Automatic Enrollment if score exists
      const score = (course as any).score;
      if (score !== undefined) {
        await adminSupabase
          .from('user_courses')
          .upsert({
            user_id: user.id,
            course_id: dbCourse.id,
            status: 'completed',
            progress: 100,
            score: parseFloat(score),
            gpa: parseFloat(score) >= 60 ? (parseFloat(score) / 20).toFixed(2) : 0, // Simple heuristic for GPA
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,course_id' });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed ${coursesToUpsert.length} courses and updated user roadmap.` 
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Bulk import error:", error);
    return NextResponse.json({ 
      error: "Batch processing failure", 
      details: errorMessage
    }, { status: 500 });
  }
}