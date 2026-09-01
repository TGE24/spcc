// Admin: manage an event's photo gallery (PRD §5.8, Milestone 6 — "Event
// photo galleries"). Photos are hosted-link references (image_url), same
// pattern as homilies' audio_url, since there's no Storage upload pipeline
// in V1. Shown publicly on the matching /events/[id] detail page.
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ChurchEvent, EventPhoto } from "@/types/database";
import { addEventPhoto, deleteEventPhoto } from "./actions";

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
    <div className="max-w-2xl">
      <Link href="/admin/events" className="text-sm text-neutral-500 hover:underline">
        ← Back to Events
      </Link>
      <h1 className="text-xl font-semibold mt-2 mb-1">{event.title} — Photos</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Paste a link to a hosted image (e.g. from your parish&rsquo;s photo storage). It&rsquo;ll
        appear in the gallery on the public event page.
      </p>

      <form action={addEventPhoto} className="border rounded p-4 mb-8 space-y-3 text-sm">
        <input type="hidden" name="event_id" value={event.id} />
        <input
          name="image_url"
          placeholder="https://..."
          type="url"
          required
          className="w-full border rounded px-2 py-1"
        />
        <button type="submit" className="bg-neutral-900 text-white rounded px-4 py-1.5">
          Add Photo
        </button>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos?.map((photo) => (
          <div key={photo.id} className="space-y-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.image_url}
              alt=""
              className="aspect-square w-full rounded object-cover border"
            />
            <form action={deleteEventPhoto.bind(null, event.id, photo.id)}>
              <button className="text-xs text-red-600 hover:underline">Delete</button>
            </form>
          </div>
        ))}
        {!photos?.length && <p className="text-neutral-400 text-sm col-span-full">No photos yet.</p>}
      </div>
    </div>
  );
}
