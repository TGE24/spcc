// Annual Harvest & Thanksgiving pledge page (PRD §5.10), linked from Home's
// Harvest CTA and Mass Schedule's welcome CTA. Pledges are informational —
// payment is handled offline (parish office follow-up), per the PRD's V1 scope.
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";
import { submitHarvestPledge } from "./actions";

export default async function HarvestPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;

  return (
    <main className="flex-1">
      <section className="relative h-[360px] overflow-hidden md:h-[420px]">
        <PlaceholderImage slot="harvest/hero" label="Hero photo" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[#1b1919]/45" />
        <SiteHeader />
        <div className="absolute left-1/2 top-[62%] w-[92%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-3xl font-bold md:text-5xl">Annual Harvest &amp; Thanksgiving</h1>
          <p className="mx-auto mt-5 max-w-[600px] text-base md:text-lg">
            Celebrate God&rsquo;s blessings with us — make your pledge below and our parish office
            will follow up on payment.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:px-[100px]">
        <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Make a Pledge</h2>
            <p className="mt-2 text-sm text-gray-500">
              Pledges may be made as a family, a group, or a society. Our parish office will
              contact you to arrange payment — no payment is collected on this page.
            </p>

            {success && (
              <p className="mt-6 rounded-xl bg-brand-50 px-5 py-4 text-sm font-medium text-brand-700">
                Thank you for your pledge — the parish office will be in touch.
              </p>
            )}
            {error && (
              <p className="mt-6 rounded-xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{error}</p>
            )}

            <form action={submitHarvestPledge} className="mt-6 space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="pledger_name">
                  Name (individual, family, group, or society)
                </label>
                <input
                  id="pledger_name"
                  name="pledger_name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="category">
                  Pledging as
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                >
                  <option value="family">Family</option>
                  <option value="group">Group</option>
                  <option value="society">Society</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="pledge_details">
                  Pledge Details (optional)
                </label>
                <textarea
                  id="pledge_details"
                  name="pledge_details"
                  rows={4}
                  placeholder="What you're pledging, and any notes for the parish office"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-3xl bg-brand-600 px-7 py-4 text-base font-medium text-white"
              >
                Submit Pledge
              </button>
            </form>
          </div>

          <PlaceholderImage slot="harvest/info" label="Harvest photo" className="h-[300px] rounded-2xl md:h-full" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
