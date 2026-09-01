// Shared building blocks for the admin dashboard's dark, "premium" theme.
// Plain presentational wrappers around native form elements (not client
// components) so server-action forms (action={someServerAction}) keep
// working exactly as before — only the classNames change.
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const fieldBase =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition focus:border-brand-700/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-brand-700/20";

export function AdminInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldBase} ${className ?? ""}`} {...rest} />;
}

export function AdminTextarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${fieldBase} ${className ?? ""}`} {...rest} />;
}

export function AdminSelect({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${fieldBase} ${className ?? ""}`} {...rest} />;
}

export function AdminLabel({ className, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`mb-1.5 block text-xs font-medium text-neutral-400 ${className ?? ""}`} {...rest} />;
}

const buttonBase =
  "inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
const buttonVariants = {
  primary: "bg-brand-600 px-4 py-2 text-white shadow-sm shadow-black/30 hover:bg-brand-700",
  ghost: "border border-white/10 px-4 py-2 text-neutral-200 hover:border-white/20 hover:bg-white/5",
  subtle: "px-3 py-1.5 text-neutral-300 hover:bg-white/5",
  danger: "px-0 py-0 text-red-400 hover:text-red-300 hover:underline",
} as const;

export function AdminButton({
  variant = "primary",
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonVariants }) {
  return <button className={`${buttonBase} ${buttonVariants[variant]} ${className ?? ""}`} {...rest} />;
}

export function AdminCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] md:p-6 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export function AdminPageHeader({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
      {description && <p className="mt-1.5 max-w-2xl text-sm text-neutral-400">{description}</p>}
    </div>
  );
}

export function AdminSectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={`mb-4 text-sm font-medium text-neutral-200 ${className ?? ""}`}>{children}</h2>;
}

const badgeTones = {
  neutral: "border-white/10 bg-white/5 text-neutral-300",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  warn: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  danger: "border-red-500/20 bg-red-500/10 text-red-300",
  brand: "border-brand-700/25 bg-brand-700/15 text-brand-700",
} as const;

export function AdminBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: keyof typeof badgeTones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${badgeTones[tone]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

export function AdminEmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-neutral-500">
      {children}
    </p>
  );
}

// Thin wrapper that gives <table> the dark treatment consistently — header
// row, row dividers, and cell padding — without every admin page repeating
// the same handful of classes.
export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function AdminTHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-white/10 bg-white/[0.03] text-xs font-medium uppercase tracking-wide text-neutral-500">
        {children}
      </tr>
    </thead>
  );
}
