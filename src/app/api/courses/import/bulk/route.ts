import { NextResponse } from 'next/server';
import { runD1, queryD1 } from '@/lib/d1';

export async function POST(request: Request) {
  try {
    const courses = await request.json();
    if (!Array.isArray(courses)) {
      return NextResponse.json({ error: "Invalid data format. Expected an array of courses." }, { status: 400 });
    }

    let successCount = 0;
    let skipCount = 0;

    for (const course of courses) {
      const { university, courseCode, title, description, url, level } = course;
      
      if (!university || !courseCode || !title) {
        skipCount++;
        continue;
      }

      // Check for duplicates
      const existing = await queryD1('SELECT id FROM courses WHERE course_code = ? LIMIT 1', [courseCode]);
      if (existing.length > 0) {
        skipCount++;
        continue;
      }

      // Insert
      await runD1(`
        INSERT INTO courses (university, course_code, title, description, url, level, popularity)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `, [university, courseCode, title, description || "", url || "#", level || "undergraduate"]);
      
      successCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Bulk operation complete. ${successCount} initialized, ${skipCount} skipped.` 
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ error: "Batch processing failure" }, { status: 500 });
  }
}
