// In-memory stand-in for the Supabase client used by server actions, pages
// and route handlers. It records every query chain (table, operation,
// payload, filters, terminal) and resolves each one with whatever result the
// test queued for that table + operation, defaulting to
// `{ data: null, error: null }`.
//
//   const db = supabase();
//   db.respond("events", "select", { data: [event] });
//   db.respond("events", "insert", { error: { message: "boom" } });
//   ...run code...
//   expect(db.callsTo("events", "insert")[0].payload).toEqual({...});
//
// Responses queue per key: several queued responses are used in order and
// the last one keeps answering. A function responder receives the call.
import { vi } from "vitest";

export type Op = "select" | "insert" | "update" | "delete" | "upsert";

export type Call = {
  table: string;
  op: Op;
  payload?: unknown;
  columns?: string;
  options?: unknown;
  returning?: string;
  filters: [method: string, args: unknown[]][];
  terminal?: "single" | "maybeSingle" | "then";
};

export type Result = { data?: unknown; error?: unknown; count?: number | null };
type Responder = Result | ((call: Call) => Result);

const CHAIN_METHODS = [
  "eq",
  "neq",
  "lt",
  "lte",
  "gt",
  "gte",
  "or",
  "in",
  "is",
  "not",
  "like",
  "ilike",
  "match",
  "filter",
  "order",
  "limit",
  "range",
  "returns",
] as const;

function okUser(id = "user-1") {
  return { data: { user: { id, email: "staff@example.com" } }, error: null };
}

export function createSupabaseFake() {
  const calls: Call[] = [];
  const responders = new Map<string, Responder[]>();

  function resolve(call: Call): Result {
    const queue = responders.get(`${call.table}:${call.op}`) ?? responders.get(`${call.table}:*`);
    if (!queue || queue.length === 0) return {};
    const next = queue.length > 1 ? queue.shift()! : queue[0];
    return typeof next === "function" ? next(call) : next;
  }

  function from(table: string) {
    const call: Call = { table, op: "select", filters: [] };
    let opSet = false;
    const builder: any = {};

    for (const method of CHAIN_METHODS) {
      builder[method] = (...args: unknown[]) => {
        call.filters.push([method, args]);
        return builder;
      };
    }
    builder.select = (columns?: string, options?: unknown) => {
      if (!opSet) {
        call.op = "select";
        call.columns = columns;
        call.options = options;
        opSet = true;
      } else {
        call.returning = columns ?? "*";
      }
      return builder;
    };
    for (const op of ["insert", "update", "delete", "upsert"] as const) {
      builder[op] = (payload?: unknown, options?: unknown) => {
        call.op = op;
        call.payload = payload;
        call.options = options;
        opSet = true;
        return builder;
      };
    }

    // A responder that throws becomes a rejected promise, like a network
    // failure in the real client, never a synchronous throw.
    const finish = (terminal: NonNullable<Call["terminal"]>) => {
      call.terminal = terminal;
      calls.push(call);
      return new Promise<Result>((res) => res(resolve(call))).then((r) => ({
        data: r.data ?? null,
        error: r.error ?? null,
        count: r.count ?? null,
      }));
    };
    builder.single = () => finish("single");
    builder.maybeSingle = () => finish("maybeSingle");
    builder.then = (onFulfilled?: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
      finish("then").then(onFulfilled, onRejected);
    return builder;
  }

  const storageBucket = {
    upload: vi.fn(async () => ({ data: { path: "x" }, error: null as unknown })),
    getPublicUrl: vi.fn((path: string) => ({
      data: { publicUrl: `https://proj.supabase.co/storage/v1/object/public/site-images/${path}` },
    })),
    remove: vi.fn(async () => ({ data: [], error: null as unknown })),
  };

  const auth = {
    getUser: vi.fn(async () => okUser() as { data: { user: { id: string; email?: string } | null }; error: unknown }),
    signInWithPassword: vi.fn(async () => ({ data: {}, error: null as unknown })),
    signOut: vi.fn(async () => ({ error: null as unknown })),
    resetPasswordForEmail: vi.fn(async () => ({ data: {}, error: null as unknown })),
    updateUser: vi.fn(async () => ({ data: {}, error: null as unknown })),
    exchangeCodeForSession: vi.fn(async () => ({ data: {}, error: null as unknown })),
    verifyOtp: vi.fn(async () => ({ data: {}, error: null as unknown })),
  };

  return {
    from: vi.fn(from),
    auth,
    storage: { from: vi.fn(() => storageBucket) },
    storageBucket,
    calls,
    respond(table: string, op: Op | "*", ...results: Responder[]) {
      responders.set(`${table}:${op}`, [...results]);
      return this;
    },
    callsTo(table: string, op?: Op) {
      return calls.filter((c) => c.table === table && (!op || c.op === op));
    },
    signedOut() {
      auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      return this;
    },
    signedInAs(id: string) {
      auth.getUser.mockResolvedValue(okUser(id));
      return this;
    },
  };
}

export type SupabaseFake = ReturnType<typeof createSupabaseFake>;

let current: SupabaseFake = createSupabaseFake();

/** The fake that `createClient()` from @/lib/supabase/server returns in this test. */
export function supabase() {
  return current;
}

export function resetSupabase() {
  current = createSupabaseFake();
  return current;
}
