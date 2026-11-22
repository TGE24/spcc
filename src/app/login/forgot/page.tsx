import type { Metadata } from "next";
import { sendResetLink } from "../actions";
import { Notice, QuietLink, SheetHeading, fieldClass, labelClass, primaryButtonClass } from "../ui";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Reset Password" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  if (sent) {
    return (
      <>
        <SheetHeading title="Check your email">
          If that address belongs to a staff account, a reset link is on its way. The link only works once.
        </SheetHeading>
        <p className="text-sm leading-relaxed text-[#9fb09c]">
          Nothing after a few minutes? Check your spam folder, or{" "}
          <a
            href="/login/forgot"
            className="text-sp-gold-light underline underline-offset-4 hover:text-[#e3c98c]"
          >
            send it again
          </a>
          .
        </p>
        <div className="mt-8 flex justify-center">
          <QuietLink href="/login">Back to sign in</QuietLink>
        </div>
      </>
    );
  }

  return (
    <>
      <SheetHeading title="Reset your password">
        Enter your staff email and we&apos;ll send you a link to choose a new password.
      </SheetHeading>

      {error && <Notice tone="error">{error}</Notice>}

      <form action={sendResetLink} className="space-y-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            className={fieldClass}
          />
        </div>
        <div className="pt-2">
          <SubmitButton pendingText="Sending…" className={primaryButtonClass}>
            Send reset link
          </SubmitButton>
        </div>
      </form>

      <div className="mt-6 flex justify-center">
        <QuietLink href="/login">Back to sign in</QuietLink>
      </div>
    </>
  );
}
