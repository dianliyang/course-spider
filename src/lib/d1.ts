import { Course } from './scrapers/types';

const REMOTE_DB = process.env.REMOTE_DB === 'true';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

// Interface for the D1 Binding (Cloudflare Workers type)
interface D1DatabaseBinding {
  prepare: (query: string) => D1PreparedStatement;
  dump: () => Promise<ArrayBuffer>;
  batch: (statements: D1PreparedStatement[]) => Promise<D1Result[]>;
  exec: (query: string) => Promise<D1ExecResult>;
}

interface D1PreparedStatement {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = unknown>(colName?: string) => Promise<T | null>;
  run: <T = unknown>() => Promise<D1Result<T>>;
  all: <T = unknown>() => Promise<D1Result<T>>;
  raw: <T = unknown>() => Promise<T[]>;
}

interface D1Result<T = unknown> {
  success: boolean;
  meta: unknown;
  results: T[];
}

interface D1ExecResult {
  count: number;
  duration: number;
}

// Helper to get local DB path using dynamic imports to avoid Edge crashes
function getLocalDbPath(): string | null {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs');

  const baseDir = path.join(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
  if (!fs.existsSync(baseDir)) return null;
  
  const files = fs.readdirSync(baseDir);
  const sqliteFile = files.find((f: string) => f.endsWith('.sqlite'));
  return sqliteFile ? path.join(baseDir, sqliteFile) : null;
}

export async function queryD1<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  // 1. Try D1 Binding (Cloudflare Pages/Workers)
  // 'DB' is the binding name defined in wrangler.toml
  const bindingDB = (process.env.DB as unknown as D1DatabaseBinding);
  
  if (bindingDB && typeof bindingDB.prepare === 'function') {
    try {
      const stmt = bindingDB.prepare(sql).bind(...params);
      if (sql.trim().toLowerCase().startsWith('select')) {
        const result = await stmt.all<T>();
        return result.results || [];
      } else {
        const result = await stmt.run<T>();
        // Normalize run result to array for consistency if needed, or return generic
        return [result] as unknown as T[];
      }
    } catch (e) {
      console.error("[D1 Binding] Query failed:", e);
      throw e;
    }
  }

  // 2. Remote HTTP API
  if (REMOTE_DB) {
    if (!ACCOUNT_ID || !DATABASE_ID || !API_TOKEN) {
      // Fallback to wrangler CLI if credentials aren't in env (Local Dev interacting with Remote)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { exec } = require('child_process');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { promisify } = require('util');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      
      const execAsync = promisify(exec);
      
      const tmpFileName = path.join(process.cwd(), `.tmp_query_${Date.now()}.sql`);
      try {
        let processedSql = sql;
        params.forEach(param => {
          const escaped = typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : (param ?? 'NULL');
          processedSql = processedSql.replace('?', String(escaped));
        });

        console.log(`[D1 Remote] Executing: ${processedSql.substring(0, 100)}...`);
        const { stdout } = await execAsync(`npx wrangler d1 execute code-campus-db --remote --command="${processedSql.replace(/"/g, '\\"')}" --json`);
        
        if (processedSql.trim().toLowerCase().startsWith('select')) {
          const jsonMatch = stdout.match(/\[[\s\S]*\]/);
          if (!jsonMatch) throw new Error("No JSON array found in wrangler output");
          
          const result = JSON.parse(jsonMatch[0]);
          const dataResult = result.find((r: unknown) => {
            const res = r as { results?: unknown[] };
            return res.results && Array.isArray(res.results) && res.results.length > 0;
          }) as { results?: T[] } | undefined;
          
          return (dataResult?.results || (result[result.length - 1] as { results?: T[] })?.results || []) as T[];
        }
        return [] as T[];
      } catch (e) {
        console.error("Wrangler fallback failed:", e);
        throw new Error("Missing Cloudflare credentials and wrangler fallback failed");
      } finally {
        if (fs.existsSync(tmpFileName)) fs.unlinkSync(tmpFileName);
      }
    }

    // HTTP API Call
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql, params })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`D1 API Error: ${response.status} ${text}`);
    }

    const json = await response.json();
    if (!json.success) throw new Error(`D1 Query Failed: ${JSON.stringify(json.errors)}`);
    return json.result[0].results as T[];
  } 

  // 3. Local Mode (better-sqlite3)
  else {
    const dbPath = getLocalDbPath();
    if (!dbPath) {
      // If we are in prod (no REMOTE_DB, no Binding, no Local file), this is fatal.
      console.warn("Local D1 database file not found. Returning empty results.");
      return [];
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Database = require('better-sqlite3');
      const db = new Database(dbPath, { readonly: false });
      try {
        const stmt = db.prepare(sql);
        if (sql.trim().toLowerCase().startsWith('select')) {
          return stmt.all(...params) as T[];
        } else {
          const info = stmt.run(...params);
          return [info] as unknown as T[];
        }
      } finally {
        db.close();
      }
    } catch (e) {
      console.error("Local D1 execution failed:", e);
      return [];
    }
  }
}

/**
 * Specifically for non-returning statements (INSERT, UPDATE, DELETE)
 */
export async function runD1(sql: string, params: unknown[] = []): Promise<unknown> {
  return queryD1(sql, params);
}

// Helper to parse the JSON 'details' column and map other fields
export function mapCourseFromRow(row: Record<string, unknown>): Course & { id: number; url: string } {
  const university = (row.university as string || "").toLowerCase();
  const courseCode = row.course_code as string || "";
  const dbUrl = row.url as string;
  
  // URL generation fallback
  let fallbackUrl = "#";
  const code = encodeURIComponent(courseCode);
  switch (university) {
    case 'mit':
      fallbackUrl = `https://student.mit.edu/catalog/search.cgi?search=${code}`;
      break;
    case 'stanford':
      fallbackUrl = `https://explorecourses.stanford.edu/search?q=${code}`;
      break;
    case 'ucb':
      fallbackUrl = `https://classes.berkeley.edu/search/class/${code}`;
      break;
    case 'cmu':
      fallbackUrl = "https://enr-apps.as.cmu.edu/open/SOC/SOCServlet/search";
      break;
  }

  return {
    id: row.id as number,
    university: university,
    courseCode: courseCode,
    title: row.title as string || "",
    units: row.units as string || "",
    description: row.description as string || "",
    url: dbUrl || fallbackUrl,
    department: row.department as string || "",
    corequisites: row.corequisites as string || "",
    level: row.level as string || "",
    difficulty: (row.difficulty as number) || 0,
    details: typeof row.details === 'string' ? JSON.parse(row.details) : (row.details || {}),
    popularity: (row.popularity as number) || 0,
    workload: (row.workload as string) || "",
    isHidden: Boolean(row.is_hidden)
  };
}