import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: paper, error: fetchError } = await supabase
      .from("past_papers")
      .select("download_count")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (fetchError || !paper) {
      return Response.json({ success: false, error: "Paper not found" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("past_papers")
      .update({ download_count: (paper.download_count || 0) + 1 })
      .eq("id", id);

    if (updateError) {
      return Response.json({ success: false, error: "Failed to update count" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false, error: "Failed to track download" }, { status: 500 });
  }
}
