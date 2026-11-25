// Admin: one baptism request — the family's baptismal particulars (laid out
// in the same order as the parish's paper form) and the form staff use to
// confirm it by scheduling the baptism and the practice. Saving emails the
// family; saving again reschedules and emails the new dates.
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BaptismInquiry } from "@/types/database";
import { siteConfig } from "@/lib/site-config";
import { todayISODate } from "@/lib/events";
import { scheduleBaptism, updateInquiryStatus } from "../actions";
import { ScheduleFields } from "./schedule-fields";
import { STATUS_TONE, formatDay, formatTime } from "../format";
import {
  AdminAlert,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminPageHeader,
  AdminSectionLabel,
} from "@/components/admin/ui";

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid gap-1 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-xs font-medium text-neutral-500 sm:pt-0.5">{label}</dt>
      <dd className={value ? "text-sm text-neutral-100" : "text-sm text-neutral-600"}>{value || "Not given"}</dd>
    </div>
  );
}

export default async function AdminBaptismInquiryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; email?: string }>;
}) {
  const { id } = await params;
  const { error, saved, email } = await searchParams;
  const emailFailed = email === "failed";
  const supabase = await createClient();
  const { data: inquiry } = await supabase
    .from("baptism_inquiries")
    .select("*")
    .eq("id", id)
    .maybeSingle<BaptismInquiry>();

  if (!inquiry) notFound();

  const scheduled = inquiry.status === "scheduled" || Boolean(inquiry.baptism_date);
  // Requests made before the particulars form only have the combined names.
  const legacy = !inquiry.family_name && !inquiry.baptismal_name;

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <Link href="/admin/baptism-inquiries" className="text-sm text-neutral-500 hover:text-neutral-300">
          ← Back to Baptism Requests
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <AdminPageHeader
            title={inquiry.child_name}
            description={`Requested ${formatDay(inquiry.created_at.slice(0, 10))} by ${inquiry.parent_name}.`}
          />
          <AdminBadge tone={STATUS_TONE[inquiry.status]}>{inquiry.status}</AdminBadge>
        </div>
      </div>

      {error && <AdminAlert>{error}</AdminAlert>}
      {saved && !emailFailed && (
        <AdminAlert tone="success">
          Schedule saved. We&apos;ve emailed the dates to {inquiry.email}.
        </AdminAlert>
      )}
      {saved && emailFailed && (
        <AdminAlert tone="warn">
          Schedule saved, but the email to {inquiry.email} couldn&apos;t be sent, so the family doesn&apos;t
          have the dates yet. Let them know another way{inquiry.phone ? ` (${inquiry.phone})` : ""}, or press
          Update schedule to try the email again.
        </AdminAlert>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
        <AdminCard>
          <AdminSectionLabel>Baptismal particulars</AdminSectionLabel>
          <dl className="divide-y divide-white/5">
            {legacy ? (
              <>
                <Row label="Child" value={inquiry.child_name} />
                <Row label="Parent / guardian" value={inquiry.parent_name} />
              </>
            ) : (
              <>
                <Row label="Family name" value={inquiry.family_name} />
                <Row label="Baptismal name" value={inquiry.baptismal_name} />
                <Row label="Other names" value={inquiry.other_names} />
              </>
            )}
            <Row label="Town of origin" value={inquiry.town_of_origin} />
            <Row label="Address in Ibadan" value={inquiry.address} />
            <Row label="Place of birth" value={inquiry.place_of_birth} />
            <Row
              label="Date of birth"
              value={inquiry.child_date_of_birth ? formatDay(inquiry.child_date_of_birth) : null}
            />
            <Row
              label="Preferred baptism date"
              value={inquiry.preferred_date ? formatDay(inquiry.preferred_date) : null}
            />
            {!legacy && (
              <>
                <Row label="Father's name" value={inquiry.father_name} />
                <Row label="Mother's name" value={inquiry.mother_name} />
              </>
            )}
            <Row label="Godfather's name" value={inquiry.godfather_name} />
            <Row label="Godmother's name" value={inquiry.godmother_name} />
            <Row label="Email" value={inquiry.email} />
            <Row label="Phone" value={inquiry.phone} />
            {inquiry.message && <Row label="Message" value={inquiry.message} />}
          </dl>
        </AdminCard>

        <div className="space-y-6">
          <AdminCard>
            <AdminSectionLabel>{scheduled ? "Schedule" : "Confirm & schedule"}</AdminSectionLabel>
            {scheduled && inquiry.baptism_date && inquiry.practice_date && (
              <div className="mb-6 grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
                <div>
                  <p className="text-xs text-neutral-500">Practice</p>
                  <p className="text-neutral-100">
                    {formatDay(inquiry.practice_date)}, {formatTime(inquiry.practice_time)}
                  </p>
                  <p className="text-xs text-neutral-400">{inquiry.practice_place}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Baptism</p>
                  <p className="text-neutral-100">
                    {formatDay(inquiry.baptism_date)}, {formatTime(inquiry.baptism_time)}
                  </p>
                  <p className="text-xs text-neutral-400">{inquiry.baptism_place}</p>
                </div>
              </div>
            )}
            <form action={scheduleBaptism.bind(null, inquiry.id)} className="grid gap-6">
              <ScheduleFields
                today={todayISODate()}
                defaultPlace={siteConfig.parishFullName}
                initial={inquiry}
              />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <p className="text-xs text-neutral-500">
                  {scheduled
                    ? "Saving changes emails the family the new dates."
                    : "Confirming emails both dates to the family."}
                </p>
                <AdminButton type="submit">{scheduled ? "Update schedule" : "Confirm baptism"}</AdminButton>
              </div>
            </form>
          </AdminCard>

          {inquiry.status !== "closed" && (
            <AdminCard>
              <AdminSectionLabel>{scheduled ? "After the baptism" : "Not going ahead?"}</AdminSectionLabel>
              {scheduled ? (
                <>
                  <p className="mb-4 text-sm text-neutral-400">
                    Once the baptism has taken place, add it to Baptism Records. The form is filled in from this
                    request, and saving the record closes it.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/admin/baptism-records?from=${inquiry.id}`}
                      className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-black/30 transition-all duration-200 hover:bg-brand-700"
                    >
                      Add baptism record
                    </Link>
                    <form action={updateInquiryStatus.bind(null, inquiry.id, "closed")}>
                      <AdminButton type="submit" variant="ghost">
                        Close without a record
                      </AdminButton>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-4 text-sm text-neutral-400">
                    If the family withdraws or the request is a duplicate, close it to take it off the list.
                  </p>
                  <form action={updateInquiryStatus.bind(null, inquiry.id, "closed")}>
                    <AdminButton type="submit" variant="ghost">
                      Close request
                    </AdminButton>
                  </form>
                </>
              )}
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
}
