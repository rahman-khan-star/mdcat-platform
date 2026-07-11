import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <main className="lg:pl-[260px] transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
