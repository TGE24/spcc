import { createClient } from "@/lib/supabase/server";
import type { Announcement } from "@/types/database";
import { addAnnouncement, deleteAnnouncement } from "./actions";
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminInput,
  AdminLabel,
  AdminPageHeader,
  AdminTextarea,
} from "@/components/admin/ui";

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("active_from", { ascending: false })
    .returns<Announcement[]>();

  const now = new Date();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Announcements"
        description="Post a banner that appears at the top of the homepage while it's active."
      />

      <AdminCard>
        <h2 className="text-sm font-semibold text-neutral-200">New announcement</h2>
        <form action={addAnnouncement} className="mt-4 grid gap-4">
          <div>
            <AdminLabel htmlFor="title">Title</AdminLabel>
            <AdminInput id="title" name="title" required placeholder="Christmas Mass Schedule" />
          </div>
          <div>
            <AdminLabel htmlFor="body">Body (optional)</AdminLabel>
            <AdminTextarea id="body" name="body" rows={2} placeholder="Additional details…" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <AdminLabel htmlFor="active_from">Active from</AdminLabel>
              <AdminInput id="active_from" name="active_from" type="datetime-local" required />
            </div>
            <div>
              <AdminLabel htmlFor="active_to">Active until (optional)</AdminLabel>
              <AdminInput id="active_to" name="active_to" type="datetime-local" />
            </div>
          </div>
          <div>
            <AdminButton type="submit">Post announcement</AdminButton>
          </div>
        </form>
      </AdminCard>

      <div className="space-y-3">
        {!announcements || announcements.length === 0 ? (
          <AdminEmptyState>No announcements yet.</AdminEmptyState>
        ) : (
          announcements.map((a) => {
            const from = new Date(a.active_from);
            const to = a.active_to ? new Date(a.active_to) : null;
            const isLive = from <= now && (!to || to >= now);
            return (
              <AdminCard key={a.id} className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-neutral-100">{a.title}</h3>
                    {isLive && <AdminBadge tone="success">Live now</AdminBadge>}
                  </div>
                  {a.body && <p className="mt-1 text-sm text-neutral-400">{a.body}</p>}
                  <p className="mt-2 text-xs text-neutral-500">
                    {from.toLocaleString()} {to ? `— ${to.toLocaleString()}` : "— no end date"}
                  </p>
                </div>
                <form action={deleteAnnouncement.bind(null, a.id)}>
                  <AdminButton type="submit" variant="danger">
                    Delete
                  </AdminButton>
                </form>
              </AdminCard>
            );
          })
        )}
      </div>
    </div>
  );
}
