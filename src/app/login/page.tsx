import { signIn } from "./actions";
import { SubmitButton } from "@/components/submit-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <form action={signIn} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Staff Login</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <SubmitButton
          pendingText="Signing in..."
          className="w-full bg-neutral-900 text-white rounded py-2 text-sm hover:bg-neutral-800 hover:shadow-md"
        >
          Sign in
        </SubmitButton>
      </form>
    </main>
  );
}
