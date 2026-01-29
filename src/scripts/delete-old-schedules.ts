// Script to delete old schedules
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function deleteOldSchedules() {
  // First, let's see what schedules exist
  const { data: allSchedules } = await supabase
    .from('study_schedules')
    .select('scheduled_date')
    .order('scheduled_date', { ascending: true });
  
  console.log('📋 All scheduled dates:');
  const uniqueDates = [...new Set(allSchedules?.map(s => s.scheduled_date))];
  uniqueDates.slice(0, 20).forEach(d => console.log('   ', d));
  if (uniqueDates.length > 20) console.log('   ... and', uniqueDates.length - 20, 'more');
  
  // Delete schedules before 2026-01-29 (today)
  const { data, error } = await supabase
    .from('study_schedules')
    .delete()
    .lt('scheduled_date', '2026-01-29')
    .select('id');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('\n🗑️ Deleted', data?.length || 0, 'entries before 2026-01-29');
  }
}

deleteOldSchedules().catch(console.error);
