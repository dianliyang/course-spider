import { queryD1, mapCourseFromRow } from "@/lib/d1";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Sidebar from "@/components/home/Sidebar";
import CourseList from "@/components/home/CourseList";
import { University, Field, Course } from "@/types";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // Parse params
  const page = parseInt((params.page as string) || "1");
  const size = 10;
  const offset = (page - 1) * size;
  const query = (params.q as string) || "";
  const sort = (params.sort as string) || "relevance";
  const enrolledOnly = params.enrolled === "true";
  
  const universities = ((params.universities as string) || "").split(",").filter(Boolean);
  const fields = ((params.fields as string) || "").split(",").filter(Boolean);
  const levels = ((params.levels as string) || "").split(",").filter(Boolean);

  // Mock user for demo
  const mockEmail = "test@example.com";

  // Data Fetching logic (Server Side) with Revalidation
  const [dbCourses, dbUniversities, dbFields, dbEnrolled] = await Promise.all([
    fetchCourses(page, size, offset, query, sort, enrolledOnly, universities, fields, levels, mockEmail),
    queryD1<University>('SELECT university as name, COUNT(*) as count FROM courses WHERE is_hidden = 0 GROUP BY university ORDER BY count DESC'),
    queryD1<Field>('SELECT f.name, COUNT(cf.course_id) as count FROM fields f JOIN course_fields cf ON f.id = cf.field_id GROUP BY f.id ORDER BY count DESC'),
    queryD1<{ course_id: number }>('SELECT course_id FROM user_courses WHERE user_id = (SELECT id FROM users WHERE email = ? LIMIT 1)', [mockEmail])
  ]);

  const enrolledIds = dbEnrolled.map(r => r.course_id);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <Hero />
      
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col md:flex-row gap-8">
        <Sidebar 
          universities={dbUniversities} 
          fields={dbFields} 
          enrolledCount={enrolledIds.length} 
        />
        
        <CourseList 
          initialCourses={dbCourses.items}
          totalItems={dbCourses.total}
          totalPages={dbCourses.pages}
          currentPage={page}
          initialEnrolledIds={enrolledIds}
        />
      </div>
    </div>
  );
}

// Add segment config for revalidation
export const revalidate = 60; // Revalidate the whole page every 60 seconds

async function fetchCourses(
  page: number, 
  size: number, 
  offset: number, 
  query: string, 
  sort: string, 
  enrolledOnly: boolean,
  universities: string[],
  fields: string[],
  levels: string[],
  mockEmail: string
) {
  let whereClause = 'WHERE is_hidden = 0';
  whereClause += ' AND c.id IN (SELECT MIN(id) FROM courses GROUP BY course_code)';
  const queryParams: (string | number)[] = [];

  if (enrolledOnly) {
    whereClause += ` AND c.id IN (SELECT course_id FROM user_courses WHERE user_id = (SELECT id FROM users WHERE email = ? LIMIT 1))`;
    queryParams.push(mockEmail);
  }

  if (query) {
    whereClause += ` AND (c.title LIKE ? OR c.description LIKE ? OR c.course_code LIKE ?)`;
    const searchPattern = `%${query}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }

  if (universities.length > 0) {
    const placeholders = universities.map(() => '?').join(',');
    whereClause += ` AND university IN (${placeholders})`;
    queryParams.push(...universities);
  }

  if (fields.length > 0) {
    const placeholders = fields.map(() => '?').join(',');
    whereClause += ` AND c.id IN (SELECT cf.course_id FROM course_fields cf JOIN fields f ON cf.field_id = f.id WHERE f.name IN (${placeholders}))`;
    queryParams.push(...fields);
  }

  if (levels.length > 0) {
    const placeholders = levels.map(() => '?').join(',');
    whereClause += ` AND level IN (${placeholders})`;
    queryParams.push(...levels);
  }

  let orderBy = 'ORDER BY c.id DESC';
  if (sort === 'popularity') orderBy = 'ORDER BY c.popularity DESC, c.id DESC';
  else if (sort === 'newest') orderBy = 'ORDER BY c.created_at DESC';
  else if (sort === 'title') orderBy = 'ORDER BY c.title ASC';

  const countSql = `SELECT count(*) as count FROM courses c ${whereClause}`;
  const countResult = await queryD1<{ count: number }>(countSql, queryParams);
  const total = Number(countResult[0]?.count || 0);
  const pages = Math.max(1, Math.ceil(total / size));

  const selectSql = `
    SELECT c.*, 
           GROUP_CONCAT(DISTINCT f.name) as field_names,
           GROUP_CONCAT(DISTINCT s.term || ' ' || s.year) as semester_names
    FROM courses c
    LEFT JOIN course_fields cf ON c.id = cf.course_id
    LEFT JOIN fields f ON cf.field_id = f.id
    LEFT JOIN course_semesters cs ON c.id = cs.course_id
    LEFT JOIN semesters s ON cs.semester_id = s.id
    ${whereClause}
    GROUP BY c.id
    ${orderBy}
    LIMIT ? OFFSET ?
  `;
  const selectParams = [...queryParams, size, offset];
  const rows = await queryD1<Record<string, unknown>>(selectSql, selectParams);

  const items = rows.map(row => {
    const course = mapCourseFromRow(row);
    const { details, isHidden, ...lightCourse } = course;
    const fields = row.field_names ? (row.field_names as string).split(',') : [];
    const semesters = row.semester_names ? (row.semester_names as string).split(',') : [];
    return { ...lightCourse, fields, semesters } as Course;
  });

  return { items, total, pages };
}
