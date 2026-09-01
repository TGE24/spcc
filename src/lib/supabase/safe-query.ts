// Wraps a Supabase query so pages render gracefully (empty state) instead of
// crashing when Supabase isn't configured yet (e.g. .env.local still has
// placeholder values) or a request fails transiently. Every data-fetching
// Server Component in this app should read through this rather than calling
// .select() directly.
type QueryLike<T> = PromiseLike<{ data: T | null; error: unknown }>;

export async function safeQuery<T>(query: QueryLike<T>): Promise<T | null> {
  try {
    const { data, error } = await query;
    if (error) return null;
    return data;
  } catch {
    // Network error / unreachable Supabase project — fail soft.
    return null;
  }
}
