
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const cleanupSecret = Deno.env.get("CLEANUP_SECRET");
  const suppliedSecret = req.headers.get("x-cleanup-secret");

  if (!cleanupSecret || suppliedSecret !== cleanupSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: "Server configuration missing" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { data: expired, error: fetchError } = await supabase
      .from("weekly_offer_posters")
      .select("id, storage_path")
      .lte("expires_at", new Date().toISOString());

    if (fetchError) throw fetchError;

    if (!expired?.length) {
      return Response.json({ deletedRows: 0, deletedFiles: 0 });
    }

    // Remove files first. Keep database rows if storage cleanup fails.
    const paths = [...new Set(expired.map((item) => item.storage_path))];

    const { data: removedFiles, error: storageError } =
      await supabase.storage.from("weekly-offers").remove(paths);

    if (storageError) throw storageError;

    const { error: deleteError } = await supabase
      .from("weekly_offer_posters")
      .delete()
      .in("id", expired.map((item) => item.id));

    if (deleteError) {
      throw new Error(
        `Files were removed, but database cleanup failed: ${deleteError.message}`
      );
    }

    return Response.json({
      deletedRows: expired.length,
      deletedFiles: removedFiles?.length ?? 0,
    });
  } catch (error) {
    console.error("Weekly offer cleanup failed:", error);
    return Response.json({ error: "Cleanup failed; check function logs" }, { status: 500 });
  }
});
