// Admin: manage an event's photo gallery (PRD §5.8, Milestone 6 — "Event
// photo galleries"). Photos are hosted-link references (image_url), same
// pattern as homilies' audio_url, since there's no Storage upload pipeline
// in V1. Shown publicly on the matching /events/[id] detail page.
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ChurchEvent, EventPhoto } from "@/types/database";
import { addEventPhoto, deleteEventPhoto } from "./actions";
import { AdminButton, AdminCard, AdminInput, AdminPageHeader } from "@/components/admin/ui";

export default async function AdminEventPhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: event }, { data: photos }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle<ChurchEvent>(),
    supabase
      .from("event_photos")
      .select("*")
      .eq("event_id", id)
      .order("created_at", { ascending: false })
      .returns<EventPhoto[]>(),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link href="/admin/events" className="text-sm text-neutral-500 hover:text-neutral-300">
          ← Back to Events
        </Link>
        <AdminPageHeader
          title={`${event.title} — Photos`}
          description="Paste a link to a hosted image. It'll appear in the gallery on the public event page."
        />
      </div>

      <AdminCard>
        <form action={addEventPhoto} className="flex gap-3">
          <input type="hidden" name="event_id" value={event.id} />
          <AdminInput name="image_url" placeholder="https://..." type="url" required className="flex-1" />
          <AdminButton type="submit">Add Photo</AdminButton>
        </form>
      </AdminCard>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos?.map((photo) => (
          <div key={photo.id} className="space-y-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.image_url}
              alt=""
              className="aspect-square w-full rounded-lg border border-white/10 object-cover"
            />
            <form action={deleteEventPhoto.bind(null, event.id, photo.id)}>
              <button className="text-xs text-red-400 hover:underline">Delete</button>
            </form>
          </div>
        ))}
        {!photos?.length && <p className="col-span-full text-sm text-neutral-500">No photos yet.</p>}
      </div>
    </div>
  );
}
