// Pages that gate on who's signed in: the admin shell, the printable
// baptism certificate, and the login / password reset screens.
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import AdminLayout from "@/app/admin/layout";
import CertificatePage from "@/app/certificates/baptism/[id]/page";
import LoginPage from "@/app/login/page";
import ForgotPasswordPage from "@/app/login/forgot/page";
import ResetPasswordPage from "@/app/login/reset/page";
import LoginLayout from "@/app/login/layout";
import RootLayout, { metadata as rootMetadata, viewport } from "@/app/layout";
import { supabase } from "../helpers/supabase";
import { errorParam, expectNotFound, redirectTarget } from "../helpers/next";
import { record } from "../helpers/fixtures";

vi.mock("next/font/local", () => ({ default: () => ({ variable: "font-cinzel", className: "font-cinzel" }) }));
vi.mock("@vercel/analytics/next", () => ({ Analytics: () => null }));
vi.mock("@vercel/speed-insights/next", () => ({ SpeedInsights: () => null }));

const search = <T extends object>(sp: T) => ({ searchParams: Promise.resolve(sp) });

/** Depth-first search of a React element tree for a prop value. */
function findProp<T>(node: ReactNode, prop: string): T | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findProp<T>(child, prop);
      if (found) return found;
    }
    return undefined;
  }
  if (!isValidElement(node)) return undefined;
  const props = (node as ReactElement<Record<string, unknown>>).props;
  if (typeof props[prop] === "function") return props[prop] as T;
  return findProp<T>(props.children as ReactNode, prop);
}

function staff(role: "super_admin" | "church_staff" | "content_manager", full_name = "Mary Ann Obi") {
  return supabase()
    .signedInAs("staff-1")
    .respond("profiles", "select", { data: { id: "staff-1", full_name, role, created_at: "" } });
}

describe("Admin layout", () => {
  it("sends signed-out visitors to the login page", async () => {
    supabase().signedOut();
    expect(await redirectTarget(AdminLayout({ children: null }))).toBe("/login");
  });

  it("explains when Supabase can't be reached", async () => {
    supabase().auth.getUser.mockRejectedValueOnce(new Error("fetch failed"));
    const url = await redirectTarget(AdminLayout({ children: null }));
    expect(errorParam(url)).toMatch(/Can't reach Supabase yet/);
  });

  it("refuses an account with no staff profile", async () => {
    supabase().signedInAs("ghost");
    const url = await redirectTarget(AdminLayout({ children: null }));
    expect(errorParam(url)).toBe("No staff profile found for this account.");
  });

  it("looks the profile up by the signed-in user's id", async () => {
    const db = staff("content_manager");
    await AdminLayout({ children: null });
    expect(db.callsTo("profiles")[0].filters).toContainEqual(["eq", ["id", "staff-1"]]);
  });

  it("renders the page inside the shell with the staff member's initials and role", async () => {
    staff("church_staff");
    vi.mocked(usePathname).mockReturnValue("/admin");
    render(await AdminLayout({ children: <p>Page body</p> }));
    expect(screen.getByText("Page body")).toBeInTheDocument();
    expect(screen.getByText("MA")).toBeInTheDocument();
    expect(screen.getByText("church staff")).toBeInTheDocument();
  });

  it("hides baptism and staff tools from content managers", async () => {
    const db = staff("content_manager");
    render(await AdminLayout({ children: null }));
    expect(screen.queryByRole("link", { name: /Baptism Requests/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Baptism Records/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Staff & Roles/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Events/ })).toBeInTheDocument();
    expect(db.callsTo("baptism_inquiries")).toHaveLength(0);
  });

  it("gives church staff baptism tools but not staff management", async () => {
    staff("church_staff");
    render(await AdminLayout({ children: null }));
    expect(screen.getByRole("link", { name: /Baptism Requests/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Baptism Records/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Staff & Roles/ })).not.toBeInTheDocument();
  });

  it("gives super admins everything", async () => {
    staff("super_admin");
    render(await AdminLayout({ children: null }));
    expect(screen.getByRole("link", { name: /Staff & Roles/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Baptism Records/ })).toBeInTheDocument();
  });

  it("badges pending bookings and baptism requests", async () => {
    staff("super_admin")
      .respond("mass_bookings", "select", { count: 4 })
      .respond("baptism_inquiries", "select", { count: 2 });
    render(await AdminLayout({ children: null }));
    expect(screen.getByRole("link", { name: /Mass Bookings/ })).toHaveTextContent("4");
    expect(screen.getByRole("link", { name: /Baptism Requests/ })).toHaveTextContent("2");
  });

  it("signs out and returns to the login page", async () => {
    const db = staff("church_staff");
    const tree = await AdminLayout({ children: null });
    const signOut = findProp<() => Promise<void>>(tree, "action");
    expect(signOut).toBeDefined();
    expect(await redirectTarget(signOut!())).toBe("/login");
    expect(db.auth.signOut).toHaveBeenCalled();
  });
});

describe("Baptism certificate", () => {
  const params = { params: Promise.resolve({ id: "rec-1" }) };

  it("requires sign-in", async () => {
    supabase().signedOut();
    expect(await redirectTarget(CertificatePage(params))).toBe("/login");
  });

  it("is only for church staff and super admins", async () => {
    staff("content_manager");
    expect(await redirectTarget(CertificatePage(params))).toBe("/admin");
  });

  it("refuses an account with no profile", async () => {
    supabase().signedInAs("ghost");
    expect(await redirectTarget(CertificatePage(params))).toBe("/admin");
  });

  it("is a 404 for an unknown record", async () => {
    staff("church_staff");
    await expectNotFound(CertificatePage(params));
  });

  it("prints the record with its notations", async () => {
    staff("super_admin")
      .respond("baptism_records", "select", { data: record() })
      .respond("baptism_record_amendments", "select", {
        data: [{ id: "a1", baptism_record_id: "rec-1", amendment_text: "Godmother corrected.", amended_by: null, created_at: "2026-05-10T00:00:00Z" }],
      });
    render(await CertificatePage(params));
    expect(screen.getByRole("heading", { name: "Certificate of Baptism" })).toBeInTheDocument();
    expect(screen.getByText("Mary Ada Okafor")).toBeInTheDocument();
    expect(screen.getByText("Rev. Fr. John")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Notations" })).toBeInTheDocument();
    expect(screen.getByText("Godmother corrected.")).toBeInTheDocument();
    expect(screen.getByText("Register reference: rec-1")).toBeInTheDocument();
  });

  it("shows dashes for missing optional details and no notations section", async () => {
    staff("church_staff").respond("baptism_records", "select", {
      data: record({ officiating_priest: null, godparents: null }),
    });
    render(await CertificatePage(params));
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByRole("heading", { name: "Notations" })).not.toBeInTheDocument();
  });
});

describe("Login pages", () => {
  it("sign-in page: form, error, and success message", async () => {
    const first = render(await LoginPage(search({})));
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(document.querySelector('[name="email"]')).toBeRequired();
    expect(document.querySelector('[name="password"]')).toHaveAttribute("type", "password");
    expect(screen.getByRole("link", { name: /Forgot password/ })).toHaveAttribute("href", "/login/forgot");
    first.unmount();

    const err = render(await LoginPage(search({ error: "Wrong password", message: "ignored" })));
    expect(screen.getByRole("alert")).toHaveTextContent("Wrong password");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    err.unmount();

    render(await LoginPage(search({ message: "Password updated" })));
    expect(screen.getByRole("status")).toHaveTextContent("Password updated");
  });

  it("forgot page: form, error and the 'check your email' state", async () => {
    const first = render(await ForgotPasswordPage(search({})));
    expect(screen.getByRole("heading", { name: "Reset your password" })).toBeInTheDocument();
    expect(document.querySelector('[name="email"]')).toBeInTheDocument();
    first.unmount();

    const err = render(await ForgotPasswordPage(search({ error: "Enter your staff email address." })));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter your staff email address.");
    err.unmount();

    render(await ForgotPasswordPage(search({ sent: "1" })));
    expect(screen.getByRole("heading", { name: "Check your email" })).toBeInTheDocument();
    expect(document.querySelector('[name="email"]')).toBeNull();
  });

  it("reset page: offers a fresh link when the session has expired", async () => {
    supabase().signedOut();
    render(await ResetPasswordPage(search({})));
    expect(screen.getByRole("heading", { name: "This link has expired" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Send a new link/ })).toHaveAttribute("href", "/login/forgot");
  });

  it("reset page: asks for the new password twice when signed in from the link", async () => {
    render(await ResetPasswordPage(search({ error: "The two passwords don't match." })));
    expect(screen.getByRole("heading", { name: "Choose a new password" })).toBeInTheDocument();
    expect(document.querySelector('[name="password"]')).toHaveAttribute("minlength", "8");
    expect(document.querySelector('[name="confirm"]')).toHaveAttribute("minlength", "8");
    expect(screen.getByRole("alert")).toHaveTextContent("The two passwords don't match.");
  });

  it("login layout: parish branding around the page and a staff-only robots rule", async () => {
    render(LoginLayout({ children: <p>Inner</p> }));
    expect(screen.getByText("Inner")).toBeInTheDocument();
    expect(screen.getAllByText(/St\. Patrick/).length).toBeGreaterThan(0);
    const { metadata } = await import("@/app/login/layout");
    expect(metadata.robots).toMatchObject({ index: false });
  });
});

describe("Root layout", () => {
  it("wraps every page with the brand font, no-JS reveal fallback and analytics", () => {
    const html = renderToStaticMarkup(RootLayout({ children: <main>Content</main> } as never));
    expect(html).toContain('lang="en"');
    expect(html).toContain("font-cinzel");
    expect(html).toContain("<main>Content</main>");
    expect(html).toContain(".reveal{opacity:1 !important");
  });

  it("sets site-wide metadata", () => {
    expect(rootMetadata.title).toMatchObject({
      default: "St. Patrick's Catholic Church, Basorun",
      template: "%s | St. Patrick's Catholic Church, Basorun",
    });
    expect(rootMetadata.openGraph).toMatchObject({ type: "website" });
    expect(viewport.themeColor).toBe("#12341D");
  });
});
