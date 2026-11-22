"use client";
// Password input with a show/hide toggle — staff mostly sign in on phones,
// where a mistyped hidden password is the most common failed login.
import { useState } from "react";
import { fieldClass } from "./ui";

export function PasswordField({
  id,
  name,
  autoComplete,
  minLength,
  describedBy,
}: {
  id: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  describedBy?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        minLength={minLength}
        aria-describedby={describedBy}
        required
        className={`${fieldClass} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-[#8fa08c] transition-colors hover:text-sp-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sp-gold-light/50"
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
          <path
            d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.6" />
          {visible && <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
        </svg>
      </button>
    </div>
  );
}
