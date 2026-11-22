// Shared pieces for the staff-entrance forms (sign in, forgot, reset).
import Link from "next/link";

export const fieldClass =
  "h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-base text-neutral-50 outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-white/20 focus:border-sp-gold-light/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-sp-gold-light/15";

export const labelClass = "block text-sm font-medium text-[#c3cdc0]";

export const primaryButtonClass =
  "h-12 w-full rounded-xl bg-sp-gold-light text-[0.9375rem] font-semibold text-sp-green shadow-[0_10px_24px_-10px_rgba(215,186,120,0.55)] hover:bg-[#e3c98c] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sp-gold-light/35";

export function SheetHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 [@media(max-height:760px)]:mb-5">
      <h1 className="text-[1.625rem] font-semibold tracking-[-0.02em] text-white text-balance">{title}</h1>
      {children && <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-[#9fb09c]">{children}</p>}
    </div>
  );
}

export function Notice({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  const styles =
    tone === "error"
      ? "border-[#e5867a]/30 bg-[#e5867a]/10 text-[#f6c9c2]"
      : "border-sp-gold-light/30 bg-sp-gold-light/10 text-[#efe0b9]";
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`mb-5 flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-snug ${styles}`}
    >
      <svg viewBox="0 0 20 20" fill="none" className="mt-px size-4 shrink-0" aria-hidden>
        {tone === "error" ? (
          <>
            <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6.5v4M10 13.25v.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 10.2l2 2 4-4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
      <p>{children}</p>
    </div>
  );
}

export function QuietLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 rounded-md text-sm text-[#9fb09c] transition-colors hover:text-sp-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sp-gold-light/50"
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
        aria-hidden
      >
        <path d="M16 10H4M9 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </Link>
  );
}
