import { createClient } from "@/lib/supabase/server";
import { NotFoundError } from "@/lib/errors";
import { sanitizeSearch } from "@/lib/validation";
import type { Subject } from "@/types";

function mapSubject(row: Database["public"]["Tables"]["subjects"]["Row"]): Subject {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    totalTopics: row.total_topics,
    completedTopics: 0,
    color: row.color,
    description: row.description,
  };
}

type Database = import("@/types/supabase").Database;

export async function getAllSubjects(): Promise<Subject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapSubject);
}

export async function getSubjectById(id: string): Promise<Subject> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new NotFoundError(`Subject "${id}"`);
  return mapSubject(data);
}

export async function searchSubjects(query: string): Promise<Subject[]> {
  const clean = sanitizeSearch(query);
  if (!clean) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .or(`name.ilike.%${clean}%,description.ilike.%${clean}%`)
    .order("sort_order", { ascending: true });

  if (error) throw new Error("Failed to search subjects");
  return (data ?? []).map(mapSubject);
}
