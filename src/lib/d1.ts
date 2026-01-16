import { Course } from "./scrapers/types";
import type { D1Database } from "@cloudflare/workers-types";

export function getD1Database(): D1Database {
  // @ts-expect-error - DB is injected by Cloudflare
  const db = process.env.DB || globalThis.DB;
  if (!db) {
    // If we're in a build or non-worker environment, return a dummy object to prevent immediate crashes
    // This allows Next.js build to proceed even if it tries to initialize the adapter
    return {
      prepare: () => ({
        bind: () => ({
          all: () => Promise.resolve({ results: [] }),
          run: () => Promise.resolve({ success: true }),
          first: () => Promise.resolve(null),
        }),
      }),
      batch: () => Promise.resolve([]),
      exec: () => Promise.resolve({}),
      dump: () => Promise.resolve(new ArrayBuffer(0)),
    } as unknown as D1Database;
  }
  return db as unknown as D1Database;
}

export async function queryD1<T>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T[]> {
  const db = getD1Database();
  const stmt = db.prepare(sql).bind(...params);
  const { results } = await stmt.all<T>();
  return results as T[];
}

export async function runD1(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<void> {
  const db = getD1Database();
  await db
    .prepare(sql)
    .bind(...params)
    .run();
}

export function mapCourseFromRow(
  row: Record<string, unknown>
): Course & { id: number; url: string } {
  const university = String(row.university || "").toLowerCase();
  const courseCode = String(row.course_code || "");
  const code = encodeURIComponent(courseCode);

  const fallbacks: Record<string, string> = {
    mit: `https://student.mit.edu/catalog/search.cgi?search=${code}`,
    stanford: `https://explorecourses.stanford.edu/search?q=${code}`,
    ucb: `https://classes.berkeley.edu/search/class/${code}`,
    cmu: "https://enr-apps.as.cmu.edu/open/SOC/SOCServlet/search",
  };

  return {
    id: Number(row.id),
    university,
    courseCode,
    title: String(row.title || ""),
    units: String(row.units || ""),
    description: String(row.description || ""),
    url: (row.url as string) || fallbacks[university] || "#",
    department: String(row.department || ""),
    corequisites: String(row.corequisites || ""),
    level: String(row.level || ""),
    difficulty: Number(row.difficulty || 0),
    details:
      typeof row.details === "string"
        ? JSON.parse(row.details)
        : row.details || {},
    popularity: Number(row.popularity || 0),
    workload: String(row.workload || ""),
    isHidden: Boolean(row.is_hidden),
  };
}
