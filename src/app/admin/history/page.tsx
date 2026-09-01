// Admin: edit Parish History (PRD §5.3 admin features). Single record —
// one paragraph per line, shown on /about with the DEFAULT_HISTORY fallback
// text until this is filled in.
import { createClient } from "@/lib/supabase/server";
import type { ParishHistory } from "@/types/database";
import { saveHistory } from "./actions";

export default async function AdminHistoryPage() {
  const supabase = await createClient();
  const { data: history } = await supabase
    .from("parish_history")
    .select("*")
    .limit(1)
    .maybeSingle<ParishHistory>();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">Parish History</h1>
      <p className="text-sm text-neutral-500 mb-4">
        One paragraph per line. Until you save something here, the public About page shows
        default placeholder text.
      </p>

      <form action={saveHistory} className="border rounded p-4 space-y-3 text-sm">
        <input type="hidden" name="id" defaultValue={history?.id ?? ""} />
        <textarea
          name="content"
          rows={8}
          placeholder="Our parish was founded with...&#10;Over the years, we have grown...&#10;Today, we continue to..."
          defaultValue={history?.content ?? ""}
          className="w-full border rounded px-2 py-1"
        />
        <div className="flex gap-3">
          <input
            name="founding_date"
            type="date"
            defaultValue={history?.founding_date ?? ""}
            className="border rounded px-2 py-1"
          />
          <input
            name="founding_priest"
            placeholder="Founding priest (optional)"
            defaultValue={history?.founding_priest ?? ""}
            className="border rounded px-2 py-1 flex-1"
          />
        </div>
        <button type="submit" className="bg-neutral-900 text-white rounded px-4 py-1.5">
          Save
        </button>
      </form>
    </div>
  );
}
