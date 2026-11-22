import type { Metadata } from "next";
import { updatePassword } from "../actions";
import { PasswordField } from "../password-field";
import { Notice, QuietLink, SheetHeading, labelClass, primaryButtonClass } from "../ui";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Choose a New Password" };

// Reached from the reset and invite emails via /auth/confirm, which has
// already signed the user in. Without a session the link was used or has
// expired, so offer a fresh one instead of a dead form.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  let email: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
  } catch {
    email = null;
  }

  if (!email) {
    return (
      <>
        <SheetHeading title="This link has expired">
          Reset links work once and expire after a while. Request a new one and use it straight away.
        </SheetHeading>
        <a
          href="/login/forgot"
          className={`inline-flex items-center justify-center transition-colors ${primaryButtonClass}`}
        >
          Send a new link
        </a>
        <div className="mt-6 flex justify-center">
          <QuietLink href="/login">Back to sign in</QuietLink>
        </div>
      </>
    );
  }

  return (
    <>
      <SheetHeading title="Choose a new password">
        For <span className="text-neutral-200">{email}</span>
      </SheetHeading>

      {error && <Notice tone="error">{error}</Notice>}

      <form action={updatePassword} className="space-y-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="password">
            New password
          </label>
          <PasswordField
            id="password"
            name="password"
            autoComplete="new-password"
            minLength={8}
            describedBy="password-hint"
          />
          <p id="password-hint" className="text-[0.8125rem] text-[#8fa08c]">
            At least 8 characters.
          </p>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="confirm">
            Confirm new password
          </label>
          <PasswordField id="confirm" name="confirm" autoComplete="new-password" minLength={8} />
        </div>
        <div className="pt-2">
          <SubmitButton pendingText="Saving…" className={primaryButtonClass}>
            Save and continue
          </SubmitButton>
        </div>
      </form>
    </>
  );
}
