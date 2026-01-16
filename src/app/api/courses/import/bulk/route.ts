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
      is_internal: course.isInternal || false,
      units: course.units || "",
      department: course.department || "",
      popularity: 0
    }));

    // Perform bulk upsert using the unique constraint on (university, course_code)
    const { error } = await adminSupabase
      .from('courses')
      .upsert(coursesToUpsert, { onConflict: 'university,course_code' });

    if (error) {
      console.error("Bulk upsert error details:", error);
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed ${coursesToUpsert.length} courses.` 
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