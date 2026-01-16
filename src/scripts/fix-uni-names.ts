import { createAdminClient } from '../lib/supabase/server';

async function run() {
  const supabase = createAdminClient();
  const updates = [
    { old: 'mit', new: 'MIT' },
    { old: 'stanford', new: 'Stanford' },
    { old: 'cmu', new: 'CMU' },
    { old: 'ucb', new: 'UC Berkeley' },
    { old: 'cau', new: 'CAU Kiel' }
  ];
  
  for (const up of updates) {
    const { error } = await supabase
      .from('courses')
      .update({ university: up.new })
      .eq('university', up.old);
      
    if (error) {
      console.error(`Error updating ${up.old}:`, error);
    } else {
      console.log(`Successfully updated ${up.old} to ${up.new}`);
    }
  }
}

run().catch(console.error);
