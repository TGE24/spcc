// Home page "Quick Features": the three requests a parishioner can send the
// parish office from the website. A full-bleed St. Patrick Green band (the
// same green as the priest's-message card and the footer), set as three
// columns divided by gold hairlines rather than photo cards. Each column says
// what the service is, what happens after you send it, and links to the form;
// the whole column is the click target.
import Link from "next/link";
import { ArrowRightIcon } from "./icons";
import { Reveal } from "./reveal";

const SERVICES = [
	{
		href: "/mass-booking",
		title: "Book a Mass",
		body: "Offer a Mass for thanksgiving, for the repose of a loved one, a birthday, or any special intention.",
		next: "The parish office reviews your request and emails you once it's confirmed.",
		cta: "Book a Mass",
	},
	{
		href: "/baptism-request",
		title: "Request a Baptism",
		body: "Send your child's baptismal particulars, the same details as the paper form at the office.",
		next: "The office emails you the baptism date and the practice for parents and godparents.",
		cta: "Start a request",
	},
	{
		href: "/harvest",
		title: "Pledge to the Harvest",
		body: "Pledge toward our Annual Harvest Thanksgiving as a family, a group, or a society.",
		next: "The office contacts you to arrange payment. Nothing is paid on the website.",
		cta: "Make a pledge",
	},
];

export function ParishServices() {
	return (
		<section className="band-green relative max-w-360 mx-auto px-6 py-20 md:px-25 md:py-28">
			<Reveal className="relative max-w-2xl">
				<h2 className="font-display text-3xl font-semibold leading-tight text-sp-parchment text-balance md:text-5xl">
					The parish office, open online
				</h2>
				<p className="mt-5 text-lg leading-relaxed text-sp-sage/85 md:text-xl">
					Send a request from home, any day of the week. It goes straight to the
					parish office, and they take it from there.
				</p>
			</Reveal>

			<ul className="relative mt-14 grid border-t border-sp-gold/30 md:mt-20 md:grid-cols-3 md:border-t-0">
				{SERVICES.map((service, i) => (
					<li
						key={service.href}
						className="border-b border-sp-gold/30 md:border-b-0 md:border-l md:first:border-l-0"
					>
						<Reveal delay={i * 110} className="h-full">
							<Link
								href={service.href}
								className={`group relative flex h-full flex-col py-9 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-sp-gold-light md:py-11 ${
									i === 0 ? "md:pr-9" : i === SERVICES.length - 1 ? "md:pl-9" : "md:px-9"
								}`}
							>
								{/* Gold rule that draws across the top of the column on
								    hover/focus — the section's one moving part. */}
								<span
									aria-hidden
									className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-sp-gold-light transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100 md:-top-0.5"
								/>
								<h3 className="font-display text-2xl font-semibold text-sp-gold-light md:text-[1.7rem]">
									{service.title}
								</h3>
								<p className="mt-4 leading-relaxed text-sp-parchment/90">{service.body}</p>
								<div className="mt-7 flex gap-3 text-sm leading-relaxed text-sp-sage/75">
									<span aria-hidden className="mt-2.5 h-px w-5 shrink-0 bg-sp-gold/70" />
									<p>
										<span className="sr-only">What happens next: </span>
										{service.next}
									</p>
								</div>
								<span className="mt-auto inline-flex items-center gap-2 pt-9 text-base font-medium text-sp-parchment">
									<span className="underline decoration-sp-gold/60 decoration-1 underline-offset-[6px] transition-colors duration-200 group-hover:decoration-sp-gold-light">
										{service.cta}
									</span>
									<ArrowRightIcon className="size-4 text-sp-gold-light transition-transform duration-300 ease-out group-hover:translate-x-1" />
								</span>
							</Link>
						</Reveal>
					</li>
				))}
			</ul>
		</section>
	);
}
