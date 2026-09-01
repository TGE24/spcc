// Admin: edit Parish History (PRD §5.3 admin features). Single record —
// one paragraph per line, shown on /about with the DEFAULT_HISTORY fallback
// text until this is filled in.
import { createClient } from "@/lib/supabase/server";
import type { ParishHistory } from "@/types/database";
import { saveHistory } from "./actions";
import { AdminButton, AdminCard, AdminInput, AdminPageHeader, AdminTextarea } from "@/components/admin/ui";

export default async function AdminHistoryPage() {
  const supabase = await createClient();
  const { data: history } = await supabase
    .from("parish_history")
    .select("*")
    .limit(1)
    .maybeSingle<ParishHistory>();

  return (
    <div className="max-w-2xl space-y-8">
      <AdminPageHeader
        title="Parish History"
        description="One paragraph per line. Until you save something here, the public About page shows default placeholder text."
      />

      <AdminCard>
        <form action={saveHistory} className="grid gap-4">
          <input type="hidden" name="id" defaultValue={history?.id ?? ""} />
          <AdminTextarea
            name="content"
            rows={8}
            placeholder={"Our parish was founded with...\nOver the years, we have grown...\nToday, we continue to..."}
            defaultValue={history?.content ?? ""}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              name="founding_date"
              type="date"
              defaultValue={history?.founding_date ?? ""}
            />
            <AdminInput
              name="founding_priest"
              placeholder="Founding priest (optional)"
              defaultValue={history?.founding_priest ?? ""}
            />
          </div>
          <div>
            <AdminButton type="submit">Save</AdminButton>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}
