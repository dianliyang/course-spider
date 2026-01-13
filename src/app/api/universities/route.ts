import { NextResponse } from 'next/server';
import coursesData from '@/data/courses.json';

export async function GET() {
  const universities = Array.from(new Set(coursesData.map((c: any) => c.university)));
  
  return NextResponse.json(universities, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
