
import { supabase } from "./supabase";

export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from("weekly_offer_posters")
    .select("id, outlet, title")
    .limit(1);

  if (error) {
    console.error("Supabase test failed:", error.message);
    return;
  }

  console.log("Supabase connected successfully:", data);
}
