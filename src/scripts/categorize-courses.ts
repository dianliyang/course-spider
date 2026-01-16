import { createAdminClient } from '../lib/supabase/server';

const CATEGORIES: Record<string, string[]> = {
  'Artificial Intelligence': ['ai', 'artificial intelligence', 'machine learning', 'neural network', 'deep learning', 'nlp', 'robotics', 'computer vision', 'intelligent'],
  'Systems': ['operating system', 'distributed system', 'compiler', 'architecture', 'hardware', 'parallel', 'real-time', 'embedded'],
  'Theory': ['algorithm', 'theory', 'computation', 'complexity', 'logic', 'discrete math', 'mathematical', 'automata'],
  'Human-Computer Interaction': ['hci', 'interaction', 'user interface', 'user experience', 'ux', 'ui', 'human-centered', 'accessibility'],
  'Graphics': ['graphics', 'visualization', 'rendering', 'animation', 'geometric', 'modeling', 'image processing'],
  'Security': ['security', 'cryptography', 'privacy', 'forensics', 'vulnerability', 'attack', 'defense', 'cybersecurity'],
  'Networks': ['network', 'internet', 'wireless', 'protocol', 'routing', 'communication'],
  'Databases': ['database', 'data mining', 'sql', 'nosql', 'big data', 'information retrieval', 'data storage'],
  'Software Engineering': ['software engineering', 'development', 'testing', 'lifecycle', 'agile', 'quality assurance', 'project management'],
  'Programming Languages': ['programming language', 'semantics', 'syntax', 'interpreter', 'functional programming', 'object-oriented', 'type theory']
};

async function main() {
  const supabase = createAdminClient();
  
  console.log("Starting course categorization...");

  // 1. Ensure all fields exist
  console.log("Upserting fields...");
  for (const field of Object.keys(CATEGORIES)) {
    await supabase.from('fields').upsert({ name: field }, { onConflict: 'name' });
  }

  // 2. Map field names to IDs
  const { data: fieldRows } = await supabase.from('fields').select('id, name');
  const fieldMap = Object.fromEntries(fieldRows?.map(f => [f.name, f.id]) || []);

  // 3. Process courses in batches
  let count = 0;
  let hasMore = true;
  const BATCH_SIZE = 100;

  while (hasMore) {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, title, description')
      .range(count, count + BATCH_SIZE - 1);

    if (error) {
      console.error("Error fetching courses:", error);
      break;
    }

    if (!courses || courses.length === 0) {
      hasMore = false;
      break;
    }

    console.log(`Processing batch: ${count} to ${count + courses.length}...`);

    for (const course of courses) {
      const text = (course.title + ' ' + (course.description || '')).toLowerCase();
      
      const courseFieldInserts = [];
      
      for (const [fieldName, keywords] of Object.entries(CATEGORIES)) {
        const fieldId = fieldMap[fieldName];
        
        // Match if any keyword is present
        const isMatch = keywords.some(keyword => {
          // Use regex for word boundary matching to avoid partial matches (e.g. "rain" in "training")
          const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
          return regex.test(text);
        });

        if (isMatch) {
          courseFieldInserts.push({
            course_id: course.id,
            field_id: fieldId
          });
        }
      }

      if (courseFieldInserts.length > 0) {
        await supabase.from('course_fields').upsert(courseFieldInserts, { onConflict: 'course_id,field_id' });
      }
    }

    count += courses.length;
    if (courses.length < BATCH_SIZE) hasMore = false;
  }

  console.log(`Categorization complete. Processed ${count} courses.`);
}

main().catch(console.error);