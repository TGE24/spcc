// Printable baptism certificate (PRD §7 "Download certificate"). Lives
// outside /admin so it renders on a plain white page without the dark admin
// shell; staff print it or "Save as PDF" from the browser's print dialog.
// Access mirrors /admin/baptism-records: super_admin + church_staff only,
// checked here and again by the baptism_records RLS policies.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BaptismRecord, BaptismRecordAmendment, Profile } from "@/types/database";
import { siteConfig } from "@/lib/site-config";
import { LogoMark } from "@/components/icons";
import { PrintButton } from "@/components/print-button";

export const metadata: Metadata = {
  title: "Baptism Certificate",
  robots: { index: false, follow: false },
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BaptismCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (!profile || (profile.role !== "super_admin" && profile.role !== "church_staff")) {
    redirect("/admin");
  }

  const [{ data: record }, { data: amendments }] = await Promise.all([
    supabase.from("baptism_records").select("*").eq("id", id).maybeSingle<BaptismRecord>(),
    supabase
      .from("baptism_record_amendments")
      .select("*")
      .eq("baptism_record_id", id)
      .order("created_at", { ascending: true })
      .returns<BaptismRecordAmendment[]>(),
  ]);

  if (!record) notFound();

  const fields: [string, string][] = [
    ["Name", record.child_name],
    ["Date of birth", formatDate(record.date_of_birth)],
    ["Parents", record.parents_names],
    ["Date of baptism", formatDate(record.baptism_date)],
    ["Officiating minister", record.officiating_priest ?? "—"],
    ["Godparents", record.godparents ?? "—"],
  ];

  return (
    <main className="flex-1 bg-neutral-100 px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between print:hidden">
        <Link href="/admin/baptism-records" className="text-sm text-neutral-600 hover:text-neutral-900">
          ← Back to records
        </Link>
        <PrintButton className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Print / Save as PDF
        </PrintButton>
      </div>

      <article className="mx-auto max-w-3xl border-[6px] border-double border-brand-600 bg-white px-8 py-12 text-neutral-900 shadow-sm sm:px-14 print:max-w-none print:shadow-none">
        <header className="text-center">
          <LogoMark className="mx-auto size-14 rounded-full bg-brand-600" />
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
            {siteConfig.parishFullName}
          </p>
          <p className="mt-1 text-xs text-neutral-500">{siteConfig.address}</p>
          <h1 className="mt-8 font-serif-italic text-4xl sm:text-5xl">Certificate of Baptism</h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-neutral-600">
            This is to certify that the person named below was baptized according to the rite of the
            Catholic Church, as recorded in the baptismal register of this parish.
          </p>
        </header>

        <dl className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200">
          {fields.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[10rem_1fr] gap-4 py-3 text-sm sm:grid-cols-[12rem_1fr]">
              <dt className="font-medium text-neutral-500">{label}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {(amendments ?? []).length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Notations</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {amendments!.map((amendment) => (
                <li key={amendment.id}>
                  <span className="text-neutral-500">{formatDate(amendment.created_at)}:</span>{" "}
                  {amendment.amendment_text}
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-16 grid gap-10 text-sm sm:grid-cols-2">
          <div>
            <div className="h-10 border-b border-neutral-400" />
            <p className="mt-2 text-neutral-500">Parish Priest</p>
          </div>
          <div>
            <div className="h-10 border-b border-neutral-400" />
            <p className="mt-2 text-neutral-500">Date issued: {formatDate(new Date().toISOString())}</p>
          </div>
        </footer>

        <p className="mt-10 text-center text-[11px] text-neutral-400">Register reference: {record.id}</p>
      </article>
    </main>
  );
}
