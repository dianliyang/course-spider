import { NextResponse } from 'next/server';
import coursesData from '@/data/courses.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const size = parseInt(searchParams.get('size') || '10');

  const total = coursesData.length;
  const pages = Math.ceil(total / size);
  const offset = (page - 1) * size;
  
  const items = coursesData.slice(offset, offset + size);

  return NextResponse.json({
    items,
    total,
    page,
    size,
    pages
  });
}
