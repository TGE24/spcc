// Small line icons for the admin sidebar — same hand-authored approach as
// src/components/icons.tsx (generic UI glyphs, not distinctive artwork).
// Consistent 24x24 viewBox, stroke currentColor, so they inherit the
// sidebar's active/inactive text color automatically.
type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function GridIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function ImageStackIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="5" y="6.5" width="15" height="12" rx="2" />
      <path d="M8 15.5l3-3.2 2.4 2.4 3-3.6 1.6 2" />
      <circle cx="9.2" cy="10" r="1" fill="currentColor" stroke="none" />
      <path d="M4 9v7.5A2.5 2.5 0 006.5 19H16" />
    </svg>
  );
}

export function MegaphoneIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 11v2a1.5 1.5 0 001.5 1.5H6l1 5h2l-.7-5h1.9L17 18V6l-7.1 3.5H6A1.5 1.5 0 004.5 11z" />
      <path d="M19 9.5a3 3 0 010 5" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function ClipboardCheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="5.5" y="4.5" width="13" height="16" rx="2" />
      <path d="M9 4.5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 4.5V6H9z" />
      <path d="M9 13l2.2 2.2L15.5 11" />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0111 0" />
      <path d="M15.5 6.5a3 3 0 010 5.8M20 19a5.2 5.2 0 00-4-5" />
    </svg>
  );
}

export function MicIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="9" y="3.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21M9 21h6" />
    </svg>
  );
}

export function HammerIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M14.5 7.5l3-3 3 3-3 3M13 9l-8 8" />
      <path d="M9.5 6.5l3 3M4 20l3-3 3 3-3 3z" />
      <path d="M15.3 11.7L18.5 15l-3.2 3.2-3.2-3.2z" />
    </svg>
  );
}

export function LeafIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M19 5c-8 0-13.5 5-13.5 12 7 0 12-5.5 12-13.5" />
      <path d="M6 19c3-4 6-7 12-13" />
    </svg>
  );
}

export function BookIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5.5A2.5 2.5 0 016.5 3H12v17H6.5A2.5 2.5 0 004 17.5z" />
      <path d="M20 5.5A2.5 2.5 0 0017.5 3H12v17h5.5a2.5 2.5 0 002.5-2.5z" />
    </svg>
  );
}

export function DropletIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5S5.5 11 5.5 15a6.5 6.5 0 0013 0c0-4-6.5-11.5-6.5-11.5z" />
      <path d="M8.7 15.3a3.3 3.3 0 003.3 3.3" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

export function LogOutIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 21H6.5A2.5 2.5 0 014 18.5v-13A2.5 2.5 0 016.5 3H9" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 6H5.5A2.5 2.5 0 003 8.5v10A2.5 2.5 0 005.5 21h10a2.5 2.5 0 002.5-2.5V15" />
      <path d="M14 3h7v7M21 3l-10 10" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function InboxIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 12.5h4.2l1.5 2.5h5.6l1.5-2.5h4.2" />
      <path d="M5.2 12.5 6.8 5a1 1 0 0 1 1-.8h8.4a1 1 0 0 1 1 .8l1.6 7.5" />
      <rect x="3.5" y="12.5" width="17" height="6.3" rx="1.2" />
    </svg>
  );
}

export function QuoteIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7.5 8.5c-1.7 0-3 1.3-3 3v3.5c0 1.1.9 2 2 2h1.5v-5.5H6.2c0-1 .8-1.8 1.8-1.8V8.5z" fill="currentColor" stroke="none" />
      <path d="M16 8.5c-1.7 0-3 1.3-3 3v3.5c0 1.1.9 2 2 2h1.5v-5.5h-1.8c0-1 .8-1.8 1.8-1.8V8.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}
