"use client";
// Submit button for public server-action forms (Mass booking, harvest
// pledge, event RSVP, staff login). useFormStatus reports the pending
// state of the nearest ancestor <form>, so this only works as a distinct
// component rendered *inside* the form — a page can't read its own form's
// pending state directly, hence pulling this out instead of inlining a
// plain <button> in each page.
import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? ""}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function SubmitButton({
  children,
  pendingText,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] disabled:cursor-wait disabled:opacity-70 disabled:active:scale-100 ${className ?? ""}`}
      {...rest}
    >
      {pending && <Spinner className="size-4 shrink-0" />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
