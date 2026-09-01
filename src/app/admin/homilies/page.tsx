// Admin: manage Homilies (PRD §5.7 admin features). audio_url is a link to
// an already-hosted audio file (e.g. a file shared via cloud storage) —
// there's no upload pipeline in V1, staff just paste the link.
import { createClient } from "@/lib/supabase/server";
import type { Homily } from "@/types/database";
import { addHomily, deleteHomily } from "./actions";
import {
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminInput,
  AdminLabel,
  AdminPageHeader,
} from "@/components/admin/ui";

export default async function AdminHomiliesPage() {
  const supabase = await createClient();
  const { data: homilies } = await supabase
    .from("homilies")
    .select("*")
    .order("date", { ascending: false })
    .returns<Homily[]>();

  return (
    <div className="max-w-2xl space-y-8">
      <AdminPageHeader title="Homilies" description="Recent sermons shown on the public Homilies page." />

      <AdminCard>
        <h2 className="text-sm font-semibold text-neutral-200">Add a homily</h2>
        <form action={addHomily} className="mt-4 grid gap-4">
          <div>
            <AdminLabel htmlFor="title">Title</AdminLabel>
            <AdminInput id="title" name="title" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <AdminLabel htmlFor="date">Date</AdminLabel>
              <AdminInput id="date" name="date" type="date" required />
            </div>
            <div>
              <AdminLabel htmlFor="priest_name">Priest</AdminLabel>
              <AdminInput id="priest_name" name="priest_name" />
            </div>
          </div>
          <div>
            <AdminLabel htmlFor="bible_reference">Bible reference (optional)</AdminLabel>
            <AdminInput id="bible_reference" name="bible_reference" />
          </div>
          <div>
            <AdminLabel htmlFor="audio_url">Audio URL (link to hosted audio file)</AdminLabel>
            <AdminInput id="audio_url" name="audio_url" type="url" required />
          </div>
          <div>
            <AdminButton type="submit">Add</AdminButton>
          </div>
        </form>
      </AdminCard>

      <div className="space-y-3">
        {!homilies?.length ? (
          <AdminEmptyState>No homilies yet.</AdminEmptyState>
        ) : (
          homilies.map((homily) => (
            <AdminCard key={homily.id} className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-neutral-100">{homily.title}</p>
                <p className="mt-1 text-sm text-neutral-400">
                  {homily.date}
                  {homily.priest_name ? ` · ${homily.priest_name}` : ""}
                </p>
              </div>
              <form action={deleteHomily.bind(null, homily.id)}>
                <AdminButton type="submit" variant="danger">
                  Delete
                </AdminButton>
              </form>
            </AdminCard>
          ))
        )}
      </div>
    </div>
  );
}
