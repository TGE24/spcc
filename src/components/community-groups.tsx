// Home page "Be Part of Our Community": an invitation beside a register of
// the parish's actual groups and societies, read live from
// /admin/organizations. Each row links to that group's entry on
// /organizations. Before the office has added any groups, the register falls
// back to the groups the parish already names on the organizations page, so
// the section never shows an empty box.
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import type { Organization } from "@/types/database";
import { ArrowRightIcon } from "./icons";
import { Reveal } from "./reveal";

type Group = Pick<Organization, "id" | "name" | "meeting_schedule">;

const FALLBACK_GROUPS = [
	"Catholic Men Organization (CMO)",
	"Catholic Women Organization (CWO)",
	"CYON",
	"Choir",
	"Church Wardens",
	"Lectors",
	"Young Christian Workers (YCW)",
];

const MAX_ROWS = 7;

export function CommunityGroups({ groups }: { groups: Group[] | null }) {
	const live = groups && groups.length > 0;
	const rows = live
		? groups.slice(0, MAX_ROWS).map((g) => ({
				key: g.id,
				name: g.name,
				detail: g.meeting_schedule,
				href: `/organizations#org-${g.id}`,
			}))
		: FALLBACK_GROUPS.map((name) => ({ key: name, name, detail: null, href: "/organizations" }));
	const more = live ? groups.length - rows.length : 0;
	const phone = siteConfig.phones[0];

	return (
		<section className="band max-w-360 mx-auto px-6 py-20 md:px-25 md:py-28">
			<div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
				<Reveal className="lg:col-span-5 lg:pt-2">
					<h2 className="text-3xl font-semibold tracking-tight text-sp-ink text-balance md:text-5xl">
						Be part of our community
					</h2>
					<p className="mt-5 max-w-md text-lg leading-relaxed text-sp-muted">
						Find a group or society that fits where you are in life, and grow in
						faith alongside people who share it. The parish office can tell you
						how to join.
					</p>
					<Link
						href="/organizations"
						className="group mt-9 inline-flex items-center gap-2 rounded-full bg-sp-green px-7 py-4 text-base font-medium text-sp-parchment shadow-[0_8px_20px_-10px_rgba(18,52,29,0.6)] transition-all duration-200 hover:bg-sp-vestment active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sp-gold"
					>
						Explore all groups
						<ArrowRightIcon className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
					</Link>
					{phone && (
						<p className="mt-6 text-sm text-sp-muted">
							Not sure where to start? Call the parish office on{" "}
							<a
								href={`tel:${phone.replace(/\s+/g, "")}`}
								className="whitespace-nowrap font-medium text-sp-green underline decoration-sp-gold/60 underline-offset-4 hover:decoration-sp-green"
							>
								{phone}
							</a>
							.
						</p>
					)}
				</Reveal>

				<Reveal delay={120} className="lg:col-span-7">
					<ul className="border-t border-sp-gold/40">
						{rows.map((row) => (
							<li key={row.key} className="border-b border-sp-gold/40">
								<Link
									href={row.href}
									className="group flex items-center gap-4 py-5 outline-none focus-visible:bg-sp-sage/40 md:py-6"
								>
									<div className="min-w-0 flex-1 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
										<p className="font-display text-xl font-semibold text-sp-green md:text-2xl">
											{row.name}
										</p>
										{row.detail && (
											<p className="mt-1 text-sm text-sp-muted">{row.detail}</p>
										)}
									</div>
									<ArrowRightIcon className="size-5 shrink-0 -translate-x-2 text-sp-gold-text opacity-0 transition-all [@media(hover:none)]:translate-x-0 [@media(hover:none)]:opacity-100 duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" />
								</Link>
							</li>
						))}
					</ul>
					{more > 0 && (
						<Link
							href="/organizations"
							className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-sp-gold-text underline-offset-4 hover:underline"
						>
							And {more} more {more === 1 ? "group" : "groups"}
							<ArrowRightIcon className="size-4" />
						</Link>
					)}
				</Reveal>
			</div>
		</section>
	);
}
