import { NextResponse } from 'next/server';
import { runD1, queryD1 } from '@/lib/d1';
import { ImportRequest } from '@/types';

export async function POST(request: Request) {
  try {
    const courses = await request.json() as ImportRequest[];
    let imported = 0;
    let skipped = 0;

    for (const course of courses) {
      const { university, courseCode, title, description, url, level } = course;
      
      if (!university || !courseCode || !title) {
        skipped++;
        continue;
      }

      // Check for duplicates
      const existing = await queryD1('SELECT id FROM courses WHERE course_code = ? LIMIT 1', [courseCode]);
      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Insert
      await runD1(`
        INSERT INTO courses (university, course_code, title, description, url, level, popularity)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `, [university, courseCode, title, description || "", url || "#", level || "undergraduate"]);
      
      imported++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Bulk operation complete. ${imported} initialized, ${skipped} skipped.` 
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ error: "Batch processing failure" }, { status: 500 });
  }
}
