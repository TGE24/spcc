// Home page "Message from the Parish Priest" (content from
// /admin/priest-message). Laid out as a pastoral letter: a St. Patrick
// Green panel carrying the parish emblem and the heading in Cinzel, beside
// a white "paper" panel with the letter itself — an opening quote mark,
// the first paragraph set larger as the lead, the rest as quiet body copy,
// and a gold-rule sign-off. Stacks to one column below md.
//
// Gold usage follows the brand kit: Light Gold for gold text on green,
// Antique Gold for gold text on white, Mitre Gold only for rules/ornament.
import { LogoMark } from "./icons";

export function PriestMessageCard({
	heading,
	paragraphs,
}: {
	heading: string;
	paragraphs: string[];
}) {
	const [lead, ...rest] = paragraphs;

	return (
		<article className="grid overflow-hidden rounded-3xl bg-white shadow-xl shadow-black/10 ring-1 ring-sp-gold/25 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
			<div className="relative flex flex-col justify-between gap-10 overflow-hidden bg-sp-green px-8 py-10 text-sp-parchment md:px-12 md:py-14">
				{/* Faint oversized emblem as a watermark — texture, not content. */}
				<LogoMark className="pointer-events-none absolute -right-16 -bottom-16 size-64 opacity-[0.07] md:size-80" />

				<div className="relative">
					<LogoMark className="size-16 rounded-full ring-2 ring-sp-gold/60 ring-offset-4 ring-offset-sp-green md:size-20" />
					<p className="mt-8 text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-sp-gold-light md:text-xs">
						Pastoral Message
					</p>
					<h2 className="mt-4 font-display text-3xl leading-tight font-bold text-balance md:text-4xl">
						{heading}
					</h2>
					<span aria-hidden className="mt-6 block h-0.5 w-14 bg-sp-gold" />
				</div>

				<p className="relative text-sm text-sp-parchment/70">
					St. Patrick&apos;s Catholic Church
					<span className="block text-sp-gold-light/90">Basorun · Ibadan</span>
				</p>
			</div>

			<div className="relative px-8 py-10 md:px-14 md:py-14">
				<svg
					aria-hidden
					viewBox="0 0 48 36"
					className="h-8 w-11 text-sp-gold md:h-10 md:w-14"
					fill="currentColor"
				>
					<path d="M0 36V21.6C0 9.9 6.2 2.7 18.6 0l2.2 4.6C14 6.8 10.6 10.9 10.3 16.8H20V36H0zm28 0V21.6C28 9.9 34.2 2.7 46.6 0l2.2 4.6c-6.8 2.2-10.2 6.3-10.5 12.2H48V36H28z" />
				</svg>

				<p className="mt-6 text-xl leading-relaxed font-medium text-pretty text-sp-green md:text-2xl md:leading-snug">
					{lead}
				</p>

				{rest.length > 0 && (
					<div className="mt-6 space-y-5 text-base leading-relaxed text-pretty text-sp-muted md:text-lg">
						{rest.map((paragraph, i) => (
							<p key={i}>{paragraph}</p>
						))}
					</div>
				)}

				<div className="mt-10 flex items-center gap-4">
					<span aria-hidden className="h-px w-10 bg-sp-gold" />
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-sp-gold-text">
						The Parish Priest
					</p>
				</div>
			</div>
		</article>
	);
}
