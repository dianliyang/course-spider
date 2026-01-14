import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/d1';

export async function GET() {
  try {
    // Mock user for now
    const mockUserEmail = "test@example.com";
    
    const rows = await queryD1<{ course_id: number }>(
      'SELECT course_id FROM user_courses WHERE user_id = (SELECT id FROM users WHERE email = ? LIMIT 1)',
      [mockUserEmail]
    );

    const enrolledIds = rows.map(r => r.course_id);
    return NextResponse.json({ enrolledIds });
  } catch (error) {
    console.error("Error fetching user courses:", error);
    return NextResponse.json({ error: "Failed to fetch user courses" }, { status: 500 });
  }
}
