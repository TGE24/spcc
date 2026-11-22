// Baptism (child) request form (PRD §5.6 / Home page "Book Baptism" quick
// feature). Mirrors the parish's paper "Baptismal Particulars" form, so the
// office receives the same details it used to collect on paper. The parish
// office then confirms the request by scheduling the baptism and the
// practice for parents and godparents (/admin/baptism-inquiries/[id]); the
// family gets those dates by email. Office-only items on the paper form
// (register number, fees, the priest's signature) stay with the office.
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";
import { submitBaptismInquiry } from "./actions";
import { ParentFields } from "./parent-fields";
import { SubmitButton } from "@/components/submit-button";
import { Reveal } from "@/components/reveal";
import { todayISODate } from "@/lib/events";

export const metadata: Metadata = {
  title: "Request a Baptism",
  description:
    "Request your child's baptism at St. Patrick's Catholic Church, Basorun. The parish office will confirm the baptism and practice dates with you.",
  alternates: { canonical: "/baptism-request" },
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors duration-200 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20";
const labelClass = "mb-1 block text-sm font-medium text-gray-700";
const optional = <span className="font-normal text-gray-500"> (optional)</span>;

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-gray-200 pt-8 first:border-t-0 first:pt-0">
      <legend className="float-left mb-4 w-full font-display text-lg text-sp-green">{title}</legend>
      <div className="clear-both space-y-5">
        {hint && <p className="text-sm text-gray-500">{hint}</p>}
        {children}
      </div>
    </fieldset>
  );
}

export default async function BaptismRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const today = todayISODate();

  return (
    <main className="flex-1">
      <section className="relative min-h-[60vh] overflow-hidden">
        <PlaceholderImage slot="baptism-request/hero" label="Hero photo" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[#1b1919]/45" />
        <SiteHeader />
        <div className="absolute left-1/2 top-[62%] w-[92%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-3xl font-bold md:text-5xl">Request Your Child&rsquo;s Baptism</h1>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 py-16 md:px-[100px]">
        <Reveal className="mx-auto max-w-2xl">
          <p className="mb-10 text-sm leading-relaxed text-gray-500">
            Fill in your child&rsquo;s baptismal particulars below. The parish office will confirm the date of
            the baptism and the practice for parents and godparents, and email them to you. Please send this
            form at least three days before the baptism date you&rsquo;d like.
          </p>

          {success && (
            <p role="status" className="mb-8 rounded-xl bg-brand-50 px-5 py-4 text-sm font-medium text-brand-700">
              Thank you. Your baptism request has been sent to the parish office. We&rsquo;ll email you the
              baptism and practice dates once they&rsquo;re confirmed.
            </p>
          )}
          {error && (
            <p role="alert" className="mb-8 rounded-xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <form action={submitBaptismInquiry} className="space-y-10">
            <Section title="The child">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="family_name">
                    Family name (surname)
                  </label>
                  <input id="family_name" name="family_name" required autoComplete="off" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="baptismal_name">
                    Baptismal name
                  </label>
                  <input
                    id="baptismal_name"
                    name="baptismal_name"
                    required
                    autoComplete="off"
                    aria-describedby="baptismal-hint"
                    className={inputClass}
                  />
                  <p id="baptismal-hint" className="mt-1 text-xs text-gray-500">
                    The Christian name the child will be baptised with.
                  </p>
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="other_names">
                  Other names{optional}
                </label>
                <input id="other_names" name="other_names" autoComplete="off" className={inputClass} />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="child_date_of_birth">
                    Date of birth
                  </label>
                  <input
                    id="child_date_of_birth"
                    name="child_date_of_birth"
                    type="date"
                    required
                    max={today}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="place_of_birth">
                    Place of birth
                  </label>
                  <input
                    id="place_of_birth"
                    name="place_of_birth"
                    required
                    placeholder="e.g. Ibadan, Oyo State"
                    className={inputClass}
                  />
                </div>
              </div>
            </Section>

            <Section title="The family">
              <ParentFields inputClass={inputClass} labelClass={labelClass} />
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="town_of_origin">
                    Town of origin{optional}
                  </label>
                  <input
                    id="town_of_origin"
                    name="town_of_origin"
                    placeholder="Town, State"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="address">
                    Address in Ibadan
                  </label>
                  <input
                    id="address"
                    name="address"
                    required
                    autoComplete="street-address"
                    className={inputClass}
                  />
                </div>
              </div>
            </Section>

            <Section title="Godparents" hint="If you haven't chosen them yet, leave these blank and tell the parish office later.">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="godfather_name">
                    Godfather&rsquo;s name{optional}
                  </label>
                  <input id="godfather_name" name="godfather_name" autoComplete="off" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="godmother_name">
                    Godmother&rsquo;s name{optional}
                  </label>
                  <input id="godmother_name" name="godmother_name" autoComplete="off" className={inputClass} />
                </div>
              </div>
            </Section>

            <Section title="How we'll reach you">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="email">
                    Email
                  </label>
                  <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="phone">
                    Phone{optional}
                  </label>
                  <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
                </div>
              </div>
            </Section>

            <Section title="The baptism">
              <div className="md:w-1/2 md:pr-2.5">
                <label className={labelClass} htmlFor="preferred_date">
                  Preferred date{optional}
                </label>
                <input
                  id="preferred_date"
                  name="preferred_date"
                  type="date"
                  min={today}
                  aria-describedby="preferred-hint"
                  className={inputClass}
                />
                <p id="preferred-hint" className="mt-1 text-xs text-gray-500">
                  The parish office will confirm the final date and time.
                </p>
              </div>
              <div>
                <label className={labelClass} htmlFor="message">
                  Anything else we should know?{optional}
                </label>
                <textarea id="message" name="message" rows={4} className={inputClass} />
              </div>
            </Section>

            <SubmitButton
              pendingText="Sending..."
              className="w-full rounded-3xl bg-brand-600 px-7 py-4 text-base font-medium text-white hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25"
            >
              Send Baptism Request
            </SubmitButton>
          </form>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
