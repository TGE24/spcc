// Baptism (child) request form (PRD §5.6 / Home page "Book Baptism" quick
// feature). Previously that feature card linked to a dead /about#baptism
// anchor — this is the real destination now. Asks only for what a parent
// requesting baptism actually knows up front (their contact info, the
// child's name/DOB, an optional preferred date); officiating_priest and
// godparents belong to the permanent baptism_records entry staff create
// later, once those details are settled with the parent — see
// src/app/baptism-request/actions.ts.
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";
import { submitBaptismInquiry } from "./actions";
import { SubmitButton } from "@/components/submit-button";

export default async function BaptismRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;

  return (
    <main className="flex-1">
      <section className="relative h-[320px] overflow-hidden md:h-[380px]">
        <PlaceholderImage slot="baptism-request/hero" label="Hero photo" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[#1b1919]/45" />
        <SiteHeader />
        <div className="absolute left-1/2 top-[62%] w-[92%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-3xl font-bold md:text-5xl">Request Your Child&rsquo;s Baptism</h1>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 py-16 md:px-[100px]">
        <div className="mx-auto max-w-xl">
          <p className="mb-8 text-sm leading-relaxed text-gray-500">
            Fill out this form to begin the process. Our parish office will reach out to arrange a
            date with the priest and walk you through what&rsquo;s needed.
          </p>

          {success && (
            <p className="mb-6 rounded-xl bg-brand-50 px-5 py-4 text-sm font-medium text-brand-700">
              Thank you — your baptism request has been submitted. Our parish office will be in
              touch shortly to arrange next steps.
            </p>
          )}
          {error && (
            <p className="mb-6 rounded-xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{error}</p>
          )}

          <form action={submitBaptismInquiry} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="parent_name">
                Parent / Guardian Name
              </label>
              <input
                id="parent_name"
                name="parent_name"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="phone">
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="child_name">
                Child&rsquo;s Name
              </label>
              <input
                id="child_name"
                name="child_name"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="child_date_of_birth">
                  Child&rsquo;s Date of Birth (optional)
                </label>
                <input
                  id="child_date_of_birth"
                  name="child_date_of_birth"
                  type="date"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="preferred_date">
                  Preferred Date (optional)
                </label>
                <input
                  id="preferred_date"
                  name="preferred_date"
                  type="date"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="message">
                Anything else we should know? (optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              />
            </div>
            <SubmitButton
              pendingText="Submitting..."
              className="w-full rounded-3xl bg-brand-600 px-7 py-4 text-base font-medium text-white hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25"
            >
              Submit Request
            </SubmitButton>
          </form>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
