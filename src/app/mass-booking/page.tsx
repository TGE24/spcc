// Mass Intention booking form (PRD §5.5), linked from the Home page's
// "Book Mass Intention" quick feature. No hard capacity limit per date —
// bookings are informational for staff, who approve/reject in
// /admin/mass-bookings (tech spec §7 decision: "leave open, no hard limits").
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";
import { submitMassBooking } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { Reveal } from "@/components/reveal";

export default async function MassBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;

  return (
    <main className="flex-1">
      <section className="relative h-[320px] overflow-hidden md:h-[380px]">
        <PlaceholderImage slot="mass-booking/hero" label="Hero photo" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[#1b1919]/45" />
        <SiteHeader />
        <div className="absolute left-1/2 top-[62%] w-[92%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-3xl font-bold md:text-5xl">Book a Mass Intention</h1>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 py-16 md:px-[100px]">
        <Reveal className="mx-auto max-w-xl">
          {success && (
            <p className="mb-6 rounded-xl bg-brand-50 px-5 py-4 text-sm font-medium text-brand-700">
              Thank you — your Mass intention request has been submitted. Our parish office will
              confirm with you shortly.
            </p>
          )}
          {error && (
            <p className="mb-6 rounded-xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{error}</p>
          )}

          <form action={submitMassBooking} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="full_name">
                Your Name
              </label>
              <input
                id="full_name"
                name="full_name"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors duration-200 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors duration-200 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="phone">
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors duration-200 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="intention_type">
                Intention
              </label>
              <input
                id="intention_type"
                name="intention_type"
                required
                placeholder="e.g. Thanksgiving, In memory of..., Healing"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors duration-200 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="preferred_date">
                Preferred Date
              </label>
              <input
                id="preferred_date"
                name="preferred_date"
                type="date"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors duration-200 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="message">
                Additional Notes (optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors duration-200 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
              />
            </div>
            <SubmitButton
              pendingText="Submitting..."
              className="w-full rounded-3xl bg-brand-600 px-7 py-4 text-base font-medium text-white hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25"
            >
              Submit Request
            </SubmitButton>
          </form>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
