import { queryD1, runD1 } from '../lib/d1';

const FIELDS = {
  "AI / Machine Learning": [
    "artificial intelligence", "machine learning", "neural networks", "deep learning", "computer vision", 
    "natural language processing", "robotics", "reinforcement learning", "data science", "inference", "probabilistic", "nlp"
  ],
  "Systems & Networking": [
    "operating systems", "distributed systems", "networks", "networking", "cloud computing", "multicore", 
    "parallel programming", "database systems", "distributed computer systems", "computer networks", "virtualization", "storage"
  ],
  "Theory & Fundamentals": [
    "algorithms", "data structures", "computational complexity", "discrete mathematics", "theory", "formal reasoning", 
    "formal methods", "proof", "logic", "quantum", "optimization", "automata", "cryptography"
  ],
  "Architecture & Hardware": [
    "computer architecture", "digital systems", "circuits", "hardware", "microprocessor", "low-level", "assembly", "vlsi", "soc", "fpga", "iot"
  ],
  "Programming Languages & SE": [
    "programming languages", "compilers", "software engineering", "software construction", "software design", 
    "program analysis", "software performance", "functional programming", "semantics", "synthesis"
  ],
  "Security & Privacy": [
    "security", "cryptography", "privacy", "information security", "cybersecurity", "hacking", "vulnerability", "encryption"
  ],
  "Graphics & HCI": [
    "graphics", "rendering", "human-computer interaction", "hci", "user interface", "visualization", "interaction", "augmented reality", "virtual reality"
  ],
  "Math & Physics": [
    "mathematics", "linear algebra", "statistics", "probability", "calculus", "physics"
  ]
};

async function main() {
  console.log("Starting course categorization...");

  // 1. Ensure fields are in the database
  for (const field of Object.keys(FIELDS)) {
    try {
      await runD1('INSERT OR IGNORE INTO fields (name) VALUES (?)', [field]);
    } catch (e) {
      console.error(`Error inserting field ${field}:`, e);
    }
  }

  // Get all field IDs
  const fieldRows = await queryD1<{ id: number, name: string }>('SELECT id, name FROM fields');
  const fieldMap: Record<string, number> = {};
  fieldRows.forEach(row => { fieldMap[row.name] = row.id; });

  // 2. Fetch courses
  const courses = await queryD1<{ id: number, title: string, description: string }>('SELECT id, title, description FROM courses');
  console.log(`Analyzing ${courses.length} courses for categorization...`);

  const mappings: { courseId: number, fieldId: number }[] = [];

  for (const course of courses) {
    const text = (course.title + " " + (course.description || "")).toLowerCase();

    for (const [fieldName, keywords] of Object.entries(FIELDS)) {
      if (keywords.some(kw => text.includes(kw))) {
        mappings.push({ courseId: course.id, fieldId: fieldMap[fieldName] });
      }
    }
  }

  console.log(`Generating ${mappings.length} mappings...`);

  let count = 0;
  for (const mapping of mappings) {
    try {
      await runD1('INSERT OR IGNORE INTO course_fields (course_id, field_id) VALUES (?, ?)', [mapping.courseId, mapping.fieldId]);
      count++;
      if (count % 50 === 0) console.log(`Processed ${count}/${mappings.length} mappings...`);
    } catch (e) {
      console.error(`Error mapping course ${mapping.courseId}:`, e);
    }
  }

  console.log(`Successfully synchronized ${count} categorization records.`);
}

main().catch(console.error);
