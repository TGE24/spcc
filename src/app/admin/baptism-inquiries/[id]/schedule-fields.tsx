"use client";
// Baptism + practice scheduling fields. The practice date's latest allowed
// value follows the baptism date (the day before it), so the browser blocks
// a practice on or after the baptism before the form is ever sent. The
// server action and a database constraint re-check the same rule.
import { useState } from "react";
import { AdminInput, AdminLabel } from "@/components/admin/ui";

function dayBefore(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function ScheduleFields({
  today,
  defaultPlace,
  initial,
}: {
  today: string;
  defaultPlace: string;
  initial: {
    baptism_date: string | null;
    baptism_time: string | null;
    baptism_place: string | null;
    practice_date: string | null;
    practice_time: string | null;
    practice_place: string | null;
  };
}) {
  const [baptismDate, setBaptismDate] = useState(initial.baptism_date ?? "");
  const [practiceDate, setPracticeDate] = useState(initial.practice_date ?? "");
  const practiceMax = baptismDate ? dayBefore(baptismDate) : undefined;
  const practiceTooLate = Boolean(practiceDate && practiceMax && practiceDate > practiceMax);

  return (
    <div className="grid gap-6">
      <fieldset className="grid gap-4">
        <legend className="mb-3 text-sm font-medium text-neutral-200">Baptism</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <AdminLabel htmlFor="baptism_date">Date</AdminLabel>
            <AdminInput
              id="baptism_date"
              name="baptism_date"
              type="date"
              required
              min={today}
              value={baptismDate}
              onChange={(e) => setBaptismDate(e.target.value)}
            />
          </div>
          <div>
            <AdminLabel htmlFor="baptism_time">Time</AdminLabel>
            <AdminInput
              id="baptism_time"
              name="baptism_time"
              type="time"
              required
              defaultValue={initial.baptism_time?.slice(0, 5) ?? ""}
            />
          </div>
        </div>
        <div>
          <AdminLabel htmlFor="baptism_place">Place</AdminLabel>
          <AdminInput
            id="baptism_place"
            name="baptism_place"
            required
            defaultValue={initial.baptism_place ?? defaultPlace}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 border-t border-white/10 pt-6">
        <legend className="float-left mb-3 w-full text-sm font-medium text-neutral-200">
          Practice for parents and godparents
        </legend>
        <div className="clear-both grid gap-4 sm:grid-cols-2">
          <div>
            <AdminLabel htmlFor="practice_date">Date</AdminLabel>
            <AdminInput
              id="practice_date"
              name="practice_date"
              type="date"
              required
              max={practiceMax}
              value={practiceDate}
              onChange={(e) => setPracticeDate(e.target.value)}
              aria-describedby="practice-hint"
              aria-invalid={practiceTooLate || undefined}
            />
          </div>
          <div>
            <AdminLabel htmlFor="practice_time">Time</AdminLabel>
            <AdminInput
              id="practice_time"
              name="practice_time"
              type="time"
              required
              defaultValue={initial.practice_time?.slice(0, 5) ?? ""}
            />
          </div>
        </div>
        <p
          id="practice-hint"
          className={`-mt-1 text-xs ${practiceTooLate ? "text-red-300" : "text-neutral-500"}`}
        >
          {practiceTooLate
            ? "The practice has to be on a day before the baptism."
            : "Must be on a day before the baptism."}
        </p>
        <div>
          <AdminLabel htmlFor="practice_place">Place</AdminLabel>
          <AdminInput
            id="practice_place"
            name="practice_place"
            required
            defaultValue={initial.practice_place ?? defaultPlace}
          />
        </div>
      </fieldset>
    </div>
  );
}
