"use client";
// RSVP for an upcoming event, opened from its card on / and /events.
// Upcoming events deliberately have no detail page (only past events do,
// with a recap and photos), so the form lives in a native <dialog>: it
// brings focus trapping, Esc-to-close and the backdrop for free.
//
// Each open remounts the form (keyed on openCount) so a second RSVP from
// the same browser starts from a clean form instead of the last result.
import { useActionState, useRef, useState } from "react";
import { submitRsvp, type RsvpState } from "@/app/events/actions";
import { Spinner } from "@/components/submit-button";
import { CloseIcon } from "@/components/icons";

type Props = {
	eventId: string;
	eventTitle: string;
	dateLabel: string;
	// Filled green card vs. white card — the trigger button inverts to stay
	// the strongest element on either surface.
	onBrand?: boolean;
};

export function RsvpDialog({ eventId, eventTitle, dateLabel, onBrand }: Props) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [openCount, setOpenCount] = useState(0);

	function open() {
		setOpenCount((n) => n + 1);
		dialogRef.current?.showModal();
	}

	function close() {
		dialogRef.current?.close();
	}

	return (
		<>
			<button
				type="button"
				onClick={open}
				className={`inline-flex items-center justify-center rounded-3xl px-6 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 ${
					onBrand
						? "bg-white text-brand-600 hover:bg-brand-50 focus-visible:outline-white"
						: "bg-brand-600 text-white hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 focus-visible:outline-brand-600"
				}`}
			>
				RSVP
				<span className="sr-only"> to {eventTitle}</span>
			</button>

			<dialog
				ref={dialogRef}
				aria-labelledby={`rsvp-title-${eventId}`}
				// Clicking the backdrop (the dialog element itself, outside the
				// inner panel) closes it, matching the Esc key.
				onClick={(e) => {
					if (e.target === e.currentTarget) close();
				}}
				className="m-auto w-[calc(100%-32px)] max-w-md rounded-3xl bg-white p-0 text-gray-900 shadow-2xl shadow-black/20 backdrop:bg-[#0b1f14]/60 backdrop:backdrop-blur-[2px] open:animate-[rsvp-in_220ms_cubic-bezier(0.16,1,0.3,1)]"
			>
				{openCount > 0 && (
					<RsvpForm
						key={openCount}
						eventId={eventId}
						eventTitle={eventTitle}
						dateLabel={dateLabel}
						onClose={close}
					/>
				)}
			</dialog>
		</>
	);
}

function RsvpForm({
	eventId,
	eventTitle,
	dateLabel,
	onClose,
}: Omit<Props, "onBrand"> & { onClose: () => void }) {
	const [state, formAction, pending] = useActionState<RsvpState, FormData>(
		submitRsvp,
		{ status: "idle" },
	);

	return (
		<div className="p-6 md:p-8">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-sm font-medium text-brand-600">{dateLabel}</p>
					<h2
						id={`rsvp-title-${eventId}`}
						className="mt-1 text-2xl font-semibold tracking-tight text-balance"
					>
						{eventTitle}
					</h2>
				</div>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close"
					className="-mr-2 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
				>
					<CloseIcon className="size-5" />
				</button>
			</div>

			{state.status === "success" ? (
				<div className="mt-6" role="status">
					<p className="font-display text-4xl text-brand-600">
						See you there, {state.name}.
					</p>
					<p className="mt-3 text-gray-500">
						{state.emailed
							? "You’re on the list. We’ve emailed you the details."
							: "You’re on the list. We couldn’t email you the details, but your place is saved."}
					</p>
					<button
						type="button"
						onClick={onClose}
						className="mt-8 w-full rounded-3xl bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-700 active:scale-[0.97]"
					>
						Done
					</button>
				</div>
			) : (
				<form action={formAction} className="mt-6 space-y-4">
					<p className="text-gray-500">
						Let us know you&rsquo;re coming so we can prepare to welcome you.
					</p>
					<input type="hidden" name="event_id" value={eventId} />
					<div>
						<label
							htmlFor={`rsvp-name-${eventId}`}
							className="mb-1.5 block text-sm font-medium text-gray-700"
						>
							Your name
						</label>
						<input
							id={`rsvp-name-${eventId}`}
							name="full_name"
							required
							autoComplete="name"
							className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-50"
						/>
					</div>
					<div>
						<label
							htmlFor={`rsvp-email-${eventId}`}
							className="mb-1.5 block text-sm font-medium text-gray-700"
						>
							Email
						</label>
						<input
							id={`rsvp-email-${eventId}`}
							name="email"
							type="email"
							required
							autoComplete="email"
							className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-50"
						/>
					</div>
					{state.status === "error" && (
						<p
							role="alert"
							className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
						>
							{state.message}
						</p>
					)}
					<button
						type="submit"
						disabled={pending}
						aria-busy={pending}
						className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 active:scale-[0.97] disabled:cursor-wait disabled:opacity-70"
					>
						{pending && <Spinner className="size-4 shrink-0" />}
						{pending ? "Saving your spot…" : "Confirm RSVP"}
					</button>
				</form>
			)}
		</div>
	);
}
