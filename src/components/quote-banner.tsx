// Reusable green quote/callout banner (Figma "Quote section" — appears on
// the home page and the Mass Schedule page with the same treatment).
export function QuoteBanner({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-4 md:px-0">
      <div className="mx-auto max-w-[1128px] rounded-3xl border-[10px] border-brand-700 bg-brand-600 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_55%)] px-6 py-12 text-center text-white shadow-lg md:px-16 md:py-16">
        <h2 className="mx-auto max-w-2xl text-2xl font-semibold md:text-4xl">{title}</h2>
        <div className="mx-auto mt-8 max-w-3xl space-y-6 text-base leading-relaxed md:text-xl">
          {children}
        </div>
      </div>
    </section>
  );
}
