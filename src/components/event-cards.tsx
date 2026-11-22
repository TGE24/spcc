// Event cards shared by the Home page and /events.
//
// Upcoming events are typographic cards: a stacked month/day badge, the
// title, venue, a short description and an RSVP button. The next event up
// is filled brand green so the most time-sensitive thing leads. They don't
// link anywhere, since only past events have a detail page.
//
// Past events are photo-led "poster" cards linking to /events/[id], with the
// same date badge set over the cover photo. With no photo at all they fall
// back to a green typographic poster rather than a placeholder box.
import Link from "next/link";
import type { ChurchEvent } from "@/types/database";
import {
	eventDateParts,
	formatEventDateLong,
	relativeDayLabel,
} from "@/lib/events";
import { RsvpDialog } from "@/components/rsvp-dialog";
import {
	ArrowUpRightIcon,
	ClockIcon,
	MapPinIcon,
	PhotoIcon,
} from "@/components/icons";

function DateBadge({
	event,
	tone,
}: {
	event: ChurchEvent;
	tone: "brand" | "white" | "tint";
}) {
	const { month, day } = eventDateParts(event);
	const toneClass = {
		brand: "bg-brand-600 text-white",
		white: "bg-white text-brand-600 shadow-md shadow-black/15",
		tint: "bg-brand-50 text-brand-600",
	}[tone];
	return (
		<div
			className={`flex w-[72px] shrink-0 flex-col items-center rounded-2xl pt-2.5 pb-2.5 leading-none ${toneClass}`}
		>
			<span className="text-xs font-semibold uppercase tracking-[0.14em]">
				{month}
			</span>
			<span className="mt-1.5 text-[34px] font-bold tracking-tight tabular-nums">
				{day}
			</span>
		</div>
	);
}

export function UpcomingEventCard({
	event,
	featured = false,
}: {
	event: ChurchEvent;
	featured?: boolean;
}) {
	const { weekday } = eventDateParts(event);
	const muted = featured ? "text-white/80" : "text-gray-500";

	return (
		<article
			className={`group flex h-full flex-col rounded-3xl p-6 transition-all duration-300 md:p-8 ${
				featured
					? "bg-brand-600 text-white shadow-xl shadow-brand-600/20"
					: "border border-gray-200 bg-white text-gray-900 hover:-translate-y-1 hover:border-brand-600/30 hover:shadow-lg hover:shadow-black/5"
			}`}
		>
			<div className="flex items-start justify-between gap-4">
				<DateBadge event={event} tone={featured ? "white" : "tint"} />
				<p
					className={`pt-1 text-right text-xs font-semibold uppercase tracking-[0.12em] ${
						featured ? "text-white" : "text-brand-600"
					}`}
				>
					{relativeDayLabel(event)}
				</p>
			</div>

			<h3 className="mt-8 text-2xl font-semibold leading-tight tracking-tight text-balance md:text-[28px]">
				{event.title}
			</h3>

			<ul className={`mt-4 space-y-1.5 text-sm ${muted}`}>
				<li className="flex items-center gap-2">
					<ClockIcon className="size-4 shrink-0" />
					<span>
						{weekday}
						{event.event_time ? `, ${event.event_time}` : ""}
					</span>
				</li>
				{event.location && (
					<li className="flex items-center gap-2">
						<MapPinIcon className="size-4 shrink-0" />
						<span>{event.location}</span>
					</li>
				)}
			</ul>

			{event.description && (
				<p
					className={`mt-5 line-clamp-4 text-base leading-relaxed ${
						featured ? "text-white/90" : "text-gray-500"
					}`}
				>
					{event.description}
				</p>
			)}

			<div className="mt-auto pt-8">
				<RsvpDialog
					eventId={event.id}
					eventTitle={event.title}
					dateLabel={`${formatEventDateLong(event)}${event.event_time ? ` · ${event.event_time}` : ""}`}
					onBrand={featured}
				/>
			</div>
		</article>
	);
}

export function PastEventCard({
	event,
	coverSrc,
	photoCount,
}: {
	event: ChurchEvent;
	coverSrc: string | null;
	photoCount: number;
}) {
	return (
		<Link
			href={`/events/${event.id}`}
			className="group block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
		>
			<div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-brand-600">
				{coverSrc ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={coverSrc}
						alt=""
						className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
					/>
				) : (
					<div className="absolute inset-0 flex items-end bg-[radial-gradient(120%_80%_at_100%_0%,var(--color-brand-700)_0%,transparent_60%)] p-6">
						<p className="font-display text-4xl leading-[1.05] text-white text-balance md:text-5xl">
							{event.title}
						</p>
					</div>
				)}
				<div className="absolute left-4 top-4">
					<DateBadge event={event} tone="white" />
				</div>
				{photoCount > 0 && (
					<span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
						<PhotoIcon className="size-4" />
						{photoCount} photo{photoCount === 1 ? "" : "s"}
					</span>
				)}
			</div>
			<div className="mt-4 flex items-start justify-between gap-4 px-1">
				<div className="min-w-0">
					<h3 className="text-xl font-semibold tracking-tight text-gray-900 text-balance transition-colors duration-200 group-hover:text-brand-600">
						{event.title}
					</h3>
					{event.location && (
						<p className="mt-1 text-sm text-gray-500">{event.location}</p>
					)}
				</div>
				<ArrowUpRightIcon className="mt-1 size-5 shrink-0 text-gray-900 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" />
			</div>
		</Link>
	);
}
