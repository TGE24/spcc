// Admin: edit the Home page's "A Message from the Parish Priest" section
// (the green card overlapping the hero). Single record, same upsert-by-id
// pattern as Parish History — the one difference is what happens when it's
// empty: Parish History falls back to placeholder copy, but this section
// just doesn't render on the Home page at all until something's saved here
// (see the empty-message check in src/app/page.tsx).
import { createClient } from "@/lib/supabase/server";
import type { PriestMessage } from "@/types/database";
import { savePriestMessage } from "./actions";
import { AdminButton, AdminCard, AdminInput, AdminLabel, AdminPageHeader, AdminTextarea } from "@/components/admin/ui";

export default async function AdminPriestMessagePage() {
  const supabase = await createClient();
  const { data: priestMessage } = await supabase
    .from("priest_message")
    .select("*")
    .limit(1)
    .maybeSingle<PriestMessage>();

  return (
    <div className="max-w-2xl space-y-8">
      <AdminPageHeader
        title="Priest's Message"
        description="Shown as the green card overlapping the Home page hero. Leave the message blank and save to remove the section from the Home page entirely."
      />

      <AdminCard>
        <form action={savePriestMessage} className="grid gap-4">
          <input type="hidden" name="id" defaultValue={priestMessage?.id ?? ""} />
          <div>
            <AdminLabel htmlFor="heading">Heading (optional)</AdminLabel>
            <AdminInput
              id="heading"
              name="heading"
              placeholder="A Message from the Parish Priest"
              defaultValue={priestMessage?.heading ?? ""}
            />
          </div>
          <div>
            <AdminLabel htmlFor="message">Message — one paragraph per line</AdminLabel>
            <AdminTextarea
              id="message"
              name="message"
              rows={8}
              placeholder={"We are delighted to welcome you...\nOur mission is to nurture faith..."}
              defaultValue={priestMessage?.message ?? ""}
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
