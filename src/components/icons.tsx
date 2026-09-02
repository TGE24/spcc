// Small hand-authored icons matching the Figma design's iconography (arrow,
// sparkle/feature bullet, social glyphs). These are generic UI icons, not
// distinctive artwork, so they're recreated directly rather than needing
// exported assets.
export function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
        fill="currentColor"
      />
    </svg>
  );
}

// Matches the Figma "Upcoming Events" feature bullets (fileKey
// RPQgtnHXvxcqMDTnPLohkb, node 14:64) — three ascending bars, not a sparkle.
export function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 20v-6M12 20V4M18 20v-9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 21v-7.5H16l.5-3h-3V8.2c0-.87.24-1.46 1.5-1.46H16.6V4.14C16.3 4.1 15.3 4 14.1 4c-2.4 0-4.1 1.47-4.1 4.17V10.5H7.5v3H10V21h3.5z" />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M4 4l7.2 8.6L4.4 20h2.3l5.9-6.4L17.4 20H20l-7.5-9L19.6 4h-2.3l-5.4 5.9L9 4H4z" />
    </svg>
  );
}

export function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 5.9a8.4 8.4 0 01-2.36.65 4.07 4.07 0 001.8-2.27 8.2 8.2 0 01-2.6 1 4.1 4.1 0 00-7 3.74A11.6 11.6 0 013.1 4.9a4.1 4.1 0 001.27 5.47A4.1 4.1 0 012.8 9.7v.05a4.1 4.1 0 003.29 4.02 4.1 4.1 0 01-1.85.07 4.1 4.1 0 003.83 2.85A8.23 8.23 0 012 18.4a11.6 11.6 0 006.29 1.84c7.55 0 11.68-6.26 11.68-11.68l-.01-.53A8.35 8.35 0 0022 5.9z" />
    </svg>
  );
}

export function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.7 10h2v7h-2v-7zm1-3.3a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zM11.7 10h1.9v1c.4-.6 1.1-1.2 2.3-1.2 2.4 0 2.9 1.6 2.9 3.6V17h-2v-3.3c0-.8 0-1.8-1.1-1.8s-1.3.9-1.3 1.8V17h-2v-7z" />
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  // Placeholder crest — swap for the real Figma logo asset (see
  // public/images/README.md) once you export it from the Figma app.
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <circle cx="30" cy="30" r="30" fill="#ffffff" fillOpacity="0.15" />
      <path
        d="M30 14v32M18 24h24M22 40h16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
