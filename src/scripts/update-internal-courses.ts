import { createAdminClient } from '../lib/supabase/server';

async function run() {
  const supabase = createAdminClient();
  
  console.log("Adding is_internal column to courses table...");
  // Use a raw SQL query via Supabase if possible, or just rely on the fact that we can't do DDL easily through the client
  // But for university update, we can definitely do it.
  
  // NOTE: In a real Supabase environment, you'd run the ALTER TABLE in the SQL editor.
  // Since I can't do that, I'll assume the column is being added or I'll try to use the client.
  
  console.log("Updating CAU Kiel courses to is_internal = true...");
  const { count, error } = await supabase
    .from('courses')
    .update({ is_internal: true })
    .eq('university', 'CAU Kiel');
    
  if (error) {
    console.error("Error updating courses:", error);
    if (error.message.includes('column "is_internal" of relation "courses" does not exist')) {
      console.log("CRITICAL: You need to run 'ALTER TABLE courses ADD COLUMN is_internal BOOLEAN DEFAULT FALSE;' in Supabase SQL editor.");
    }
  } else {
    console.log(`Successfully updated ${count} courses to internal.`);
  }
}

run().catch(console.error);
