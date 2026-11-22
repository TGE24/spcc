import Link from "next/link";
import { signIn } from "./actions";
import { PasswordField } from "./password-field";
import { Notice, QuietLink, SheetHeading, fieldClass, labelClass, primaryButtonClass } from "./ui";
import { SubmitButton } from "@/components/submit-button";
import { ArrowRightIcon } from "@/components/icons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <>
      <SheetHeading title="Sign in">For parish staff only.</SheetHeading>

      {error && <Notice tone="error">{error}</Notice>}
      {message && !error && <Notice tone="success">{message}</Notice>}

      <form action={signIn} className="space-y-4">
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

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <label className={labelClass} htmlFor="password">
              Password
            </label>
            <Link
              href="/login/forgot"
              className="rounded-md text-sm text-sp-gold-light/90 underline-offset-4 transition-colors hover:text-sp-gold-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sp-gold-light/50"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordField id="password" name="password" autoComplete="current-password" />
        </div>

        <div className="pt-2">
          <SubmitButton pendingText="Signing in…" className={`group ${primaryButtonClass}`}>
            Sign in
            <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </SubmitButton>
        </div>
      </form>

      <div className="mt-6 flex justify-center">
        <QuietLink href="/">Back to website</QuietLink>
      </div>
    </>
  );
}
