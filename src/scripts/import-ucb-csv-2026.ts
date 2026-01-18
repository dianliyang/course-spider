import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Define Course interface locally to avoid import issues if any
interface CourseInput {
  university: string;
  course_code: string;
  title: string;
  units: string;
  description: string;
  department: string;
  level: string;
  is_internal: boolean;
  is_hidden: boolean;
  popularity: number;
}

// Simple CSV Parser handling quotes
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell);
        currentCell = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && nextChar === '\n') {
          i++; // Handle CRLF
        }
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }
  return rows;
}

async function main() {
  const filePath = path.join(process.cwd(), 'src/scripts/Courses Report Jan 18 2026.csv');
  console.log(`Reading file from: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf8');
  const rows = parseCSV(content);

  if (rows.length < 2) {
    console.error('CSV file is empty or invalid.');
    return;
  }

  // Header mapping
  const headers = rows[0].map(h => h.trim());
  const idxSubject = headers.indexOf('Subject');
  const idxNumber = headers.indexOf('Course Number');
  const idxTitle = headers.indexOf('Course Title');
  const idxDesc = headers.indexOf('Course Description');
  const idxUnitsMin = headers.indexOf('Credits - Units - Minimum Units');
  const idxUnitsMax = headers.indexOf('Credits - Units - Maximum Units');
  const idxDept = headers.indexOf('Department(s)');

  if (idxSubject === -1 || idxNumber === -1 || idxTitle === -1) {
    console.error('Missing required headers in CSV.');
    console.log('Headers found:', headers);
    return;
  }

  const courses: CourseInput[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < headers.length) continue; // Skip incomplete rows

    const subject = row[idxSubject].trim();
    const number = row[idxNumber].trim();
    const title = row[idxTitle].trim();
    const desc = idxDesc !== -1 ? row[idxDesc].trim() : '';
    const unitsMin = idxUnitsMin !== -1 ? row[idxUnitsMin].trim() : '';
    const unitsMax = idxUnitsMax !== -1 ? row[idxUnitsMax].trim() : '';
    const dept = idxDept !== -1 ? row[idxDept].trim() : '';

    if (!subject || !number) continue;

    const courseCode = `${subject} ${number}`;
    
    // Units logic: if min == max, use min. else min-max
    let units = unitsMin;
    if (unitsMin !== unitsMax && unitsMax && unitsMax !== '-') {
      units = `${unitsMin}-${unitsMax}`;
    }

    // Level logic
    let level = 'undergraduate';
    const numMatch = number.match(/\d+/);
    if (numMatch && parseInt(numMatch[0]) >= 200) {
      level = 'graduate';
    }

    courses.push({
      university: 'UC Berkeley', // Matches existing DB convention
      course_code: courseCode,
      title: title,
      units: units,
      description: desc,
      department: dept,
      level: level,
      is_internal: false,
      is_hidden: false,
      popularity: 0
    });
  }

  console.log(`Parsed ${courses.length} courses.`);

  // Supabase connection
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Missing Supabase credentials. Check .env.local');
    return;
  }

  const supabase = createClient(url, key);

  // Batch insert/upsert
  const batchSize = 50;
  for (let i = 0; i < courses.length; i += batchSize) {
    const batch = courses.slice(i, i + batchSize);
    console.log(`Upserting batch ${i / batchSize + 1}...`);

    const { error } = await supabase
      .from('courses')
      .upsert(batch, { onConflict: 'university,course_code' });

    if (error) {
      console.error('Error upserting batch:', error);
    }
  }

  console.log('Import complete.');
}

main().catch(err => console.error(err));
