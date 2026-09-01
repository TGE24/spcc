// Admin: manage the homepage announcement banner (PRD §5.1).
// The homepage shows the most recent announcement whose active_from/active_to
// window covers "now" — leave "Active until" blank for one that runs
// indefinitely once it starts.
import { createClient } from "@/lib/supabase/server";
import type { Announcement } from "@/types/database";
import { addAnnouncement, deleteAnnouncement } from "./actions";

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("active_from", { ascending: false })
    .returns<Announcement[]>();

  const now = new Date();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-2">Announcements</h1>
      <p className="text-sm text-neutral-500 mb-6">
        The homepage shows the most recent announcement that&rsquo;s currently active. Only one
        shows at a time.
      </p>

      <form action={addAnnouncement} className="border rounded p-4 mb-8 space-y-3 text-sm">
        <h2 className="font-medium">Add an announcement</h2>
        <input name="title" placeholder="Title" required className="w-full border rounded px-2 py-1" />
        <textarea name="body" placeholder="Details (optional)" rows={2} className="w-full border rounded px-2 py-1" />
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-neutral-500 mb-1">Active from</label>
            <input name="active_from" type="date" className="w-full border rounded px-2 py-1" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-neutral-500 mb-1">Active until (optional)</label>
            <input name="active_to" type="date" className="w-full border rounded px-2 py-1" />
          </div>
        </div>
        <button type="submit" className="bg-neutral-900 text-white rounded px-4 py-1.5">
          Add
        </button>
      </form>

      <ul className="space-y-3 text-sm">
        {announcements?.map((announcement) => {
          const from = new Date(announcement.active_from);
          const to = announcement.active_to ? new Date(announcement.active_to) : null;
          const isActive = from <= now && (!to || to >= now);
          return (
            <li key={announcement.id} className="border-b pb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {announcement.title}
                  {isActive && (
                    <span className="ml-2 rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      Live now
                    </span>
                  )}
                </p>
                {announcement.body && <p className="text-neutral-500">{announcement.body}</p>}
                <p className="text-xs text-neutral-400">
                  {from.toLocaleDateString()}
                  {to ? ` – ${to.toLocaleDateString()}` : " – ongoing"}
                </p>
              </div>
              <form action={deleteAnnouncement.bind(null, announcement.id)}>
                <button className="text-red-600 hover:underline shrink-0">Delete</button>
              </form>
            </li>
          );
        })}
        {!announcements?.length && <li className="text-neutral-400">No announcements yet.</li>}
      </ul>
    </div>
  );
}
