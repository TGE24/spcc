// Staff entrance shell — shared by sign-in, forgot-password and
// set-new-password. Phone-first: the parish seal sits in the upper half and
// the form lives in a sheet anchored to the bottom edge, in thumb reach.
// From lg up the sheet becomes a floating panel beside the seal.
//
// Dark like the admin behind it, but lit in the parish's own colours
// (St. Patrick Green + Mitre Gold) rather than the admin's neutral black.
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Staff Login",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="login-surface relative isolate flex min-h-dvh flex-1 flex-col overflow-hidden bg-[#070d09] text-neutral-100 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-6 lg:px-10">
      {/* Light source: a green wash falling from the top, and a low gold
          warmth sitting behind the seal. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(42% 30% at 50% 24%, rgba(176,141,71,0.16), transparent 72%), radial-gradient(130% 75% at 50% -8%, rgba(24,66,38,0.95), rgba(18,52,29,0.35) 55%, transparent 80%)",
        }}
      />

      <section className="flex flex-1 flex-col items-center justify-center px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-8 text-center [@media(max-height:760px)]:pt-[max(1.25rem,env(safe-area-inset-top))] [@media(max-height:760px)]:pb-5 lg:py-16">
        <Image
          src="/brand/seal-on-dark-1024.webp"
          alt="Seal of St. Patrick's Catholic Church, Basorun, Ibadan"
          width={1024}
          height={937}
          priority
          sizes="(min-width: 1024px) 400px, 240px"
          className="login-seal h-auto w-[clamp(120px,21dvh,240px)] drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)] lg:w-[min(400px,34vw)]"
        />
        <p className="mt-5 font-display text-[1.375rem] leading-tight tracking-[0.06em] text-sp-gold-light lg:mt-8 lg:text-[2rem]">
          St. Patrick&apos;s
        </p>
        <p className="mt-1.5 text-sm text-[#a7b6a4] lg:text-base">Basorun · Staff entrance</p>
      </section>

      <section className="login-sheet w-full rounded-t-[28px] border-t border-white/10 bg-[#0f1812] px-6 pt-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] [@media(max-height:760px)]:pt-6 shadow-[0_-24px_60px_-24px_rgba(0,0,0,0.9)] sm:px-8 lg:max-w-110 lg:justify-self-start lg:rounded-[28px] lg:border lg:p-10 lg:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
        <div className="mx-auto max-w-md">{children}</div>
      </section>
    </main>
  );
}
