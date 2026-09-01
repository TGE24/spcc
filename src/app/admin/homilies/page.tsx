// Admin: manage Homilies (PRD §5.7 admin features). audio_url is a link to
// an already-hosted audio file (e.g. a file shared via cloud storage) —
// there's no upload pipeline in V1, staff just paste the link.
import { createClient } from "@/lib/supabase/server";
import type { Homily } from "@/types/database";
import { addHomily, deleteHomily } from "./actions";

export default async function AdminHomiliesPage() {
  const supabase = await createClient();
  const { data: homilies } = await supabase
    .from("homilies")
    .select("*")
    .order("date", { ascending: false })
    .returns<Homily[]>();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">Homilies</h1>

      <form action={addHomily} className="border rounded p-4 mb-8 space-y-3 text-sm">
        <h2 className="font-medium">Add a homily</h2>
        <input name="title" placeholder="Title" required className="w-full border rounded px-2 py-1" />
        <div className="flex gap-3">
          <input name="date" type="date" required className="border rounded px-2 py-1" />
          <input name="priest_name" placeholder="Priest" className="border rounded px-2 py-1 flex-1" />
        </div>
        <input name="bible_reference" placeholder="Bible reference (optional)" className="w-full border rounded px-2 py-1" />
        <input
          name="audio_url"
          type="url"
          placeholder="Audio URL (link to hosted audio file)"
          required
          className="w-full border rounded px-2 py-1"
        />
        <button type="submit" className="bg-neutral-900 text-white rounded px-4 py-1.5">
          Add
        </button>
      </form>

      <ul className="space-y-3 text-sm">
        {homilies?.map((homily) => (
          <li key={homily.id} className="border-b pb-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{homily.title}</p>
              <p className="text-neutral-500">
                {homily.date}
                {homily.priest_name ? ` · ${homily.priest_name}` : ""}
              </p>
            </div>
            <form action={deleteHomily.bind(null, homily.id)}>
              <button className="text-red-600 hover:underline shrink-0">Delete</button>
            </form>
          </li>
        ))}
        {!homilies?.length && <li className="text-neutral-400">No homilies yet.</li>}
      </ul>
    </div>
  );
}
