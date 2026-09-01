// Admin: manage Events (PRD §5.8 admin features).
// image_slot lets staff point an event at a photo exported into
// public/images/<slot>.jpg (see public/images/README.md) without a Storage
// upload pipeline for V1.
import { createClient } from "@/lib/supabase/server";
import type { ChurchEvent } from "@/types/database";
import { addEvent, deleteEvent } from "./actions";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false })
    .returns<ChurchEvent[]>();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">Events</h1>

      <form action={addEvent} className="border rounded p-4 mb-8 space-y-3 text-sm">
        <h2 className="font-medium">Add an event</h2>
        <input name="title" placeholder="Title" required className="w-full border rounded px-2 py-1" />
        <textarea name="description" placeholder="Description" rows={2} className="w-full border rounded px-2 py-1" />
        <div className="flex gap-3">
          <input name="event_date" type="date" required className="border rounded px-2 py-1" />
          <input name="event_time" placeholder="Time (e.g. 9:00 AM)" className="border rounded px-2 py-1 flex-1" />
        </div>
        <input name="location" placeholder="Venue / location" className="w-full border rounded px-2 py-1" />
        <input
          name="image_slot"
          placeholder="Image slot (optional, e.g. events/lenten-retreat)"
          className="w-full border rounded px-2 py-1"
        />
        <button type="submit" className="bg-neutral-900 text-white rounded px-4 py-1.5">
          Add
        </button>
      </form>

      <ul className="space-y-3 text-sm">
        {events?.map((event) => (
          <li key={event.id} className="border-b pb-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{event.title}</p>
              <p className="text-neutral-500">
                {event.event_date}
                {event.event_time ? ` · ${event.event_time}` : ""}
                {event.location ? ` · ${event.location}` : ""}
              </p>
            </div>
            <form action={deleteEvent.bind(null, event.id)}>
              <button className="text-red-600 hover:underline shrink-0">Delete</button>
            </form>
          </li>
        ))}
        {!events?.length && <li className="text-neutral-400">No events yet.</li>}
      </ul>
    </div>
  );
}
