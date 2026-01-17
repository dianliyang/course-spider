import { createAdminClient } from "../lib/supabase/server";

async function main() {
  const supabase = createAdminClient();
  const UNIVERSITY = "mit"; // BaseScraper name is "mit", but DB might have "MIT" or "mit"
  
  console.log(`Updating department for MIT courses...`);

  // First check what's in the DB for MIT
  const { data: uniCheck } = await supabase
    .from("courses")
    .select("university")
    .ilike("university", "mit")
    .limit(1);
  
  if (!uniCheck || uniCheck.length === 0) {
    console.log("No MIT courses found.");
    return;
  }
  
  const actualUniName = uniCheck[0].university;
  console.log(`Actual university name in DB: ${actualUniName}`);

  const { count, error } = await supabase
    .from("courses")
    .update({ department: "Electrical Engineering and Computer Science" })
    .eq("university", actualUniName);

  if (error) {
    console.error("Error updating MIT courses:", error);
    return;
  }

  // Note: update doesn't return count by default in some supabase-js versions unless select is used, 
  // but let's try to get it via select or just report success.
  const { data: updatedData } = await supabase
    .from("courses")
    .select("id")
    .eq("university", actualUniName)
    .eq("department", "Electrical Engineering and Computer Science");

  console.log(`Successfully updated ${updatedData?.length || 0} MIT courses.`);
}

main();
