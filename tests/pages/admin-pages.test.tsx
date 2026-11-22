// Admin pages (inside the role-gated layout, tested separately). Each is
// rendered with realistic rows and with an empty database.
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import DashboardPage from "@/app/admin/page";
import AnnouncementsPage from "@/app/admin/announcements/page";
import InquiriesPage from "@/app/admin/baptism-inquiries/page";
import InquiryPage from "@/app/admin/baptism-inquiries/[id]/page";
import RecordsPage from "@/app/admin/baptism-records/page";
import EventsPage from "@/app/admin/events/page";
import EditEventPage from "@/app/admin/events/[id]/page";
import EventPhotosPage from "@/app/admin/events/[id]/photos/page";
import HarvestPhotosPage from "@/app/admin/harvest-photos/page";
import HarvestPledgesPage from "@/app/admin/harvest-pledges/page";
import HeroPage from "@/app/admin/hero/page";
import HistoryPage from "@/app/admin/history/page";
import HomiliesPage from "@/app/admin/homilies/page";
import MassBookingsPage from "@/app/admin/mass-bookings/page";
import MassSchedulePage from "@/app/admin/mass-schedule/page";
import OrganizationsPage from "@/app/admin/organizations/page";
import PriestMessagePage from "@/app/admin/priest-message/page";
import ProjectsPage from "@/app/admin/projects/page";
import UsersPage from "@/app/admin/users/page";
import { supabase } from "../helpers/supabase";
import { expectNotFound, form } from "../helpers/next";
import { booking, event, heroSlide, homily, inquiry, organization, record, scheduledInquiry } from "../helpers/fixtures";

vi.mock("@/app/admin/users/actions", () => ({ updateUserRole: vi.fn() }));
const { updateUserRole } = await import("@/app/admin/users/actions");

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const search = <T extends object>(sp: T) => ({ searchParams: Promise.resolve(sp) });
const heading = (name: string | RegExp) => screen.getByRole("heading", { level: 1, name });

describe("Dashboard", () => {
  it("shows counts, pending items and shortcuts", async () => {
    supabase()
      .respond("mass_bookings", "select", { count: 3 }, { data: [booking({ full_name: "Ada Obi" })] })
      .respond("events", "select", { count: 2 })
      .respond("harvest_pledges", "select", { count: 7 })
      .respond("homilies", "select", { count: 12 })
      .respond("baptism_inquiries", "select", { data: [inquiry({ child_name: "Baby Okafor" })] });
    render(await DashboardPage());
    expect(heading("Dashboard")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /3\s*Pending Bookings/ })).toHaveAttribute("href", "/admin/mass-bookings");
    expect(screen.getByRole("link", { name: /7\s*Harvest Pledges/ })).toBeInTheDocument();
    expect(screen.getByText("Ada Obi")).toBeInTheDocument();
    expect(screen.getByText("Baby Okafor")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Post an Announcement/ })).toHaveAttribute("href", "/admin/announcements");
  });

  it("shows zeros and no attention list on a fresh database", async () => {
    render(await DashboardPage());
    expect(screen.getByRole("link", { name: /0\s*Pending Bookings/ })).toBeInTheDocument();
    expect(screen.queryByText("Pending")).not.toBeInTheDocument();
  });
});

describe("Simple content lists", () => {
  it.each([
    ["Announcements", AnnouncementsPage, "announcements", { id: "a", title: "Parish picnic", body: "Bring food", active_from: "2026-06-01T00:00:00Z", active_to: null }, "Parish picnic", "No announcements yet."],
    ["Homilies", HomiliesPage, "homilies", homily(), "The Good Shepherd", "No homilies yet."],
    ["Organizations", OrganizationsPage, "organizations", organization({ name: "CYON" }), "CYON", "No groups yet."],
    ["Projects", ProjectsPage, "projects", { id: "p", title: "New roof", description: null, budget_details: null, progress_update: null, created_at: "" }, "New roof", "No projects yet."],
  ] as const)("%s: lists rows and shows an empty state", async (title, Page, table, row, text, empty) => {
    supabase().respond(table, "select", { data: [row] });
    const withRows = render(await (Page as () => Promise<ReactElement>)());
    expect(heading(title)).toBeInTheDocument();
    expect(screen.getAllByText(text).length).toBeGreaterThan(0);
    withRows.unmount();

    supabase().respond(table, "select", { data: [] });
    render(await (Page as () => Promise<ReactElement>)());
    expect(screen.getByText(empty)).toBeInTheDocument();
  });
});

describe("Baptism requests list", () => {
  it("shows confirmed dates, or the preferred date marked unconfirmed", async () => {
    supabase().respond("baptism_inquiries", "select", {
      data: [
        scheduledInquiry({ id: "s", child_name: "Scheduled Child" }),
        inquiry({ id: "p", child_name: "Pending Child" }),
        inquiry({ id: "n", child_name: "No Date Child", preferred_date: null, status: "contacted" }),
        inquiry({ id: "c", child_name: "Closed Child", status: "closed" }),
      ],
    });
    render(await InquiriesPage());
    expect(heading("Baptism Requests")).toBeInTheDocument();
    const row = (name: string) => screen.getByRole("link", { name }).closest("tr")!;

    expect(within(row("Scheduled Child")).getByText("Sun, 2 Aug 2026")).toBeInTheDocument();
    expect(within(row("Scheduled Child")).getByText(/Practice Thu, 30 Jul 2026/)).toBeInTheDocument();
    expect(within(row("Pending Child")).getByText("Preferred, not confirmed")).toBeInTheDocument();
    expect(within(row("No Date Child")).getByText("Not set")).toBeInTheDocument();

    expect(within(row("Pending Child")).getByRole("button", { name: "Mark Contacted" })).toBeInTheDocument();
    expect(within(row("No Date Child")).queryByRole("button", { name: "Mark Contacted" })).not.toBeInTheDocument();
    expect(within(row("No Date Child")).getByRole("link", { name: "Confirm & schedule" })).toHaveAttribute("href", "/admin/baptism-inquiries/n");
    expect(within(row("Closed Child")).getByRole("link", { name: "View" })).toBeInTheDocument();
  });

  it("shows an empty state", async () => {
    render(await InquiriesPage());
    expect(screen.getByText("No baptism requests yet.")).toBeInTheDocument();
  });
});

describe("Baptism request detail", () => {
  it("is a 404 for an unknown request", async () => {
    await expectNotFound(InquiryPage({ ...params("x"), ...search({}) }));
  });

  it("shows the particulars in paper-form order and a form to confirm", async () => {
    supabase().respond("baptism_inquiries", "select", { data: inquiry() });
    render(await InquiryPage({ ...params("inq-1"), ...search({}) }));
    expect(heading("Mary Ada Okafor")).toBeInTheDocument();
    const labels = [...document.querySelectorAll("dt")].map((d) => d.textContent);
    expect(labels.slice(0, 6)).toEqual(["Family name", "Baptismal name", "Other names", "Town of origin", "Address in Ibadan", "Place of birth"]);
    expect(screen.getByRole("button", { name: "Confirm baptism" })).toBeInTheDocument();
    expect(screen.getByText("Not going ahead?")).toBeInTheDocument();
  });

  it("shows the current schedule and links to add the record once scheduled", async () => {
    supabase().respond("baptism_inquiries", "select", { data: scheduledInquiry() });
    render(await InquiryPage({ ...params("inq-1"), ...search({ saved: "1" }) }));
    expect(screen.getByText(/We've emailed the dates to family@example.com/)).toBeInTheDocument();
    expect(screen.getByText("Sun, 2 Aug 2026, 10:00 am")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update schedule" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add baptism record" })).toHaveAttribute("href", "/admin/baptism-records?from=inq-1");
    expect(screen.getByRole("button", { name: "Close without a record" })).toBeInTheDocument();
  });

  it("shows an error from a failed save", async () => {
    supabase().respond("baptism_inquiries", "select", { data: inquiry() });
    render(await InquiryPage({ ...params("inq-1"), ...search({ error: "The practice has to be on a day before the baptism." }) }));
    expect(screen.getByText("The practice has to be on a day before the baptism.")).toBeInTheDocument();
  });

  it("falls back to the combined names for requests made before the particulars form", async () => {
    supabase().respond("baptism_inquiries", "select", { data: inquiry({ family_name: null, baptismal_name: null }) });
    render(await InquiryPage({ ...params("inq-1"), ...search({}) }));
    expect(screen.getByText("Child")).toBeInTheDocument();
    expect(screen.getByText("Parent / guardian")).toBeInTheDocument();
    expect(screen.queryByText("Father's name")).not.toBeInTheDocument();
  });

  it("hides the closing card for a closed request", async () => {
    supabase().respond("baptism_inquiries", "select", { data: inquiry({ status: "closed" }) });
    render(await InquiryPage({ ...params("inq-1"), ...search({}) }));
    expect(screen.queryByText("Not going ahead?")).not.toBeInTheDocument();
    expect(screen.queryByText("After the baptism")).not.toBeInTheDocument();
  });
});

describe("Baptism records", () => {
  it("lists records with amendments and certificate links", async () => {
    supabase()
      .respond("baptism_records", "select", { data: [record()] })
      .respond("baptism_record_amendments", "select", {
        data: [{ id: "am", baptism_record_id: "rec-1", amendment_text: "Spelling fixed.", amended_by: null, created_at: "2026-05-05T00:00:00Z" }],
      });
    render(await RecordsPage(search({})));
    expect(heading("Baptism Records")).toBeInTheDocument();
    expect(screen.getByText("Mary Ada Okafor")).toBeInTheDocument();
    expect(screen.getByText("Spelling fixed.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Certificate/ })).toHaveAttribute("href", "/certificates/baptism/rec-1");
  });

  it("searches by child's or parents' name", async () => {
    supabase().respond("baptism_records", "select", {
      data: [record(), record({ id: "r2", child_name: "Peter Ade", parents_names: "Tunde Ade" })],
    });
    const first = render(await RecordsPage(search({ q: "tunde" })));
    expect(screen.getByText("Peter Ade")).toBeInTheDocument();
    expect(screen.queryByText("Mary Ada Okafor")).not.toBeInTheDocument();
    first.unmount();

    render(await RecordsPage(search({ q: "nobody" })));
    expect(screen.getByText("No records match that search.")).toBeInTheDocument();
  });

  it("pre-fills the add form from a scheduled request", async () => {
    supabase().respond("baptism_inquiries", "select", { data: scheduledInquiry() });
    render(await RecordsPage(search({ from: "inq-1" })));
    expect(screen.getByText(/Filled in from/)).toBeInTheDocument();
    expect(screen.getByLabelText("Child’s name")).toHaveValue("Mary Ada Okafor");
    expect(screen.getByLabelText("Parents’ names")).toHaveValue("John Okafor & Grace Okafor");
    expect(screen.getByLabelText("Date of birth")).toHaveValue("2026-03-01");
    expect(screen.getByLabelText("Baptism date")).toHaveValue("2026-08-02");
    expect(screen.getByLabelText("Godparents")).toHaveValue("Peter Eze & Ruth Eze");
    expect(document.querySelector('input[name="inquiry_id"]')).toHaveValue("inq-1");
    expect(screen.getByRole("link", { name: "Start blank instead" })).toHaveAttribute("href", "/admin/baptism-records");
  });

  it("uses the combined parent name for older requests", async () => {
    supabase().respond("baptism_inquiries", "select", {
      data: scheduledInquiry({ father_name: null, mother_name: null, parent_name: "Mrs. Okafor" }),
    });
    render(await RecordsPage(search({ from: "inq-1" })));
    expect(screen.getByLabelText("Parents’ names")).toHaveValue("Mrs. Okafor");
  });

  it("won't pre-fill from a closed request", async () => {
    supabase().respond("baptism_inquiries", "select", { data: scheduledInquiry({ status: "closed" }) });
    render(await RecordsPage(search({ from: "inq-1" })));
    expect(screen.getByText(/couldn't be used to fill in the form/)).toBeInTheDocument();
    expect(screen.getByLabelText("Child’s name")).toHaveValue("");
    expect(document.querySelector('input[name="inquiry_id"]')).toBeNull();
  });

  it("confirms a saved record and shows errors", async () => {
    const added = render(await RecordsPage(search({ added: "Mary" })));
    expect(screen.getByText("Record added for Mary.")).toBeInTheDocument();
    added.unmount();
    render(await RecordsPage(search({ error: "Couldn't save the record." })));
    expect(screen.getByText("Couldn't save the record.")).toBeInTheDocument();
  });

  it("shows an empty state", async () => {
    render(await RecordsPage(search({})));
    expect(screen.getByText("No records yet.")).toBeInTheDocument();
  });
});

describe("Events admin", () => {
  it("lists upcoming and past events with RSVP and photo counts", async () => {
    supabase()
      .respond("events", "select", {
        data: [event({ id: "u", title: "Feast Day" }), event({ id: "p", title: "Lent Retreat", event_date: "2026-03-01" })],
      })
      .respond("event_rsvps", "select", { data: [{ event_id: "u" }, { event_id: "u" }] })
      .respond("event_photos", "select", { data: [{ event_id: "p" }] });
    render(await EventsPage(search({ saved: "1" })));
    expect(heading("Events")).toBeInTheDocument();
    expect(screen.getByText("Feast Day")).toBeInTheDocument();
    expect(screen.getByText("Lent Retreat")).toBeInTheDocument();
    expect(screen.getByText(/2 RSVPs?/)).toBeInTheDocument();
    expect(screen.getByText(/1 photo/)).toBeInTheDocument();
    expect(screen.getByText("No write-up")).toBeInTheDocument();
  });

  it("shows empty states and errors", async () => {
    render(await EventsPage(search({ error: "An event needs at least a title and a date." })));
    expect(screen.getByText("No past events yet.")).toBeInTheDocument();
    expect(screen.getByText("An event needs at least a title and a date.")).toBeInTheDocument();
  });

  it("edit page pre-fills the event or 404s", async () => {
    await expectNotFound(EditEventPage({ ...params("x"), ...search({}) }));
    supabase().respond("events", "select", { data: event() });
    render(await EditEventPage({ ...params("evt-1"), ...search({ saved: "1" }) }));
    expect(heading("Edit Parish Feast Day")).toBeInTheDocument();
    expect(document.querySelector('[name="title"]')).toHaveValue("Parish Feast Day");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("photos page lists photos or says there are none, and 404s for an unknown event", async () => {
    await expectNotFound(EventPhotosPage({ ...params("x"), ...search({}) }));

    supabase()
      .respond("events", "select", { data: event() })
      .respond("event_photos", "select", { data: [{ id: "ph", event_id: "evt-1", image_url: "/p.jpg", created_at: "" }] });
    const withPhotos = render(await EventPhotosPage({ ...params("evt-1"), ...search({}) }));
    expect(heading("Parish Feast Day — Photos")).toBeInTheDocument();
    expect(document.querySelector('img[src="/p.jpg"]')).not.toBeNull();
    withPhotos.unmount();

    supabase().respond("events", "select", { data: event() }).respond("event_photos", "select", { data: [] });
    render(await EventPhotosPage({ ...params("evt-1"), ...search({ error: "Too big" }) }));
    expect(screen.getByText("No photos yet.")).toBeInTheDocument();
    expect(screen.getByText("Too big")).toBeInTheDocument();
  });
});

describe("Homepage admin", () => {
  it("hero: default headline form and ordered slides", async () => {
    supabase()
      .respond("hero_slides", "select", { data: [heroSlide({ heading: "Christ is Risen" }), heroSlide({ id: "s2" })] })
      .respond("hero_settings", "select", { data: { id: "hs", heading: "Welcome", subheading: null, updated_at: "" } });
    render(await HeroPage(search({ saved: "1" })));
    expect(heading("Hero Slider")).toBeInTheDocument();
    expect(document.querySelector('input[name="id"]')).toHaveValue("hs");
    expect(screen.getByText("Christ is Risen")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Move up" })[0]).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Move down" }).at(-1)).toBeDisabled();
  });

  it("hero: empty state", async () => {
    render(await HeroPage(search({})));
    expect(screen.getByText(/No hero slides yet/)).toBeInTheDocument();
  });

  it("harvest photos: ordered list or empty state", async () => {
    supabase().respond("harvest_photos", "select", {
      data: [{ id: "h1", image_url: "/h1.jpg", sort_order: 0, created_at: "" }],
    });
    const first = render(await HarvestPhotosPage(search({})));
    expect(heading("Harvest Photos")).toBeInTheDocument();
    expect(document.querySelector('img[src="/h1.jpg"]')).not.toBeNull();
    first.unmount();

    supabase().respond("harvest_photos", "select", { data: [] });
    render(await HarvestPhotosPage(search({ error: "Please choose an image to upload." })));
    expect(screen.getByText(/No harvest photos yet/)).toBeInTheDocument();
    expect(screen.getByText("Please choose an image to upload.")).toBeInTheDocument();
  });

  it("priest's message: edits the saved message", async () => {
    supabase().respond("priest_message", "select", { data: { id: "pm", heading: "A Word", message: "Peace be with you.", updated_at: "" } });
    render(await PriestMessagePage());
    expect(heading("Priest's Message")).toBeInTheDocument();
    expect(document.querySelector('input[name="id"]')).toHaveValue("pm");
    expect(screen.getByDisplayValue("Peace be with you.")).toBeInTheDocument();
  });

  it("parish history: edits the saved history", async () => {
    supabase().respond("parish_history", "select", { data: { id: "h", content: "Founded 1960.", founding_date: null, founding_priest: null, updated_at: "" } });
    render(await HistoryPage());
    expect(heading("Parish History")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Founded 1960.")).toBeInTheDocument();
  });
});

describe("Services admin", () => {
  it("Mass bookings: lists bookings with actions, or an empty state", async () => {
    supabase().respond("mass_bookings", "select", { data: [booking({ full_name: "Ada Obi" })] });
    const first = render(await MassBookingsPage());
    expect(heading("Mass Bookings")).toBeInTheDocument();
    const row = screen.getByText("Ada Obi").closest("tr")!;
    expect(within(row).getByText("Thanksgiving")).toBeInTheDocument();
    expect(within(row).getAllByRole("button").length).toBeGreaterThan(0);
    first.unmount();

    supabase().respond("mass_bookings", "select", { data: [] });
    render(await MassBookingsPage());
    expect(screen.getByText("No bookings yet.")).toBeInTheDocument();
  });

  it("Mass schedule: add form and current times", async () => {
    supabase().respond("mass_schedule", "select", {
      data: [{ id: "m", day_type: "sunday", time: "07:00", label: "First Mass", special_date: null, special_name: null, created_at: "" }],
    });
    render(await MassSchedulePage());
    expect(heading("Mass Schedule")).toBeInTheDocument();
    expect(screen.getByText("First Mass")).toBeInTheDocument();
    expect([...document.querySelectorAll('[name="day_type"] option')].map((o) => (o as HTMLOptionElement).value)).toEqual([
      "sunday",
      "weekday",
      "special",
    ]);
  });

  it("Harvest pledges: lists pledges or an empty state", async () => {
    supabase().respond("harvest_pledges", "select", {
      data: [{ id: "h", pledger_name: "Obi Family", category: "family", pledge_details: "Rice", created_at: "2026-06-01T00:00:00Z" }],
    });
    const first = render(await HarvestPledgesPage());
    expect(heading("Harvest Pledges")).toBeInTheDocument();
    expect(screen.getByText("Obi Family")).toBeInTheDocument();
    first.unmount();

    supabase().respond("harvest_pledges", "select", { data: [] });
    render(await HarvestPledgesPage());
    expect(screen.getByText("No pledges yet.")).toBeInTheDocument();
  });
});

describe("Staff & Roles", () => {
  function findAction(node: ReactNode): ((fd: FormData) => Promise<void>) | undefined {
    if (Array.isArray(node)) return node.map(findAction).find(Boolean);
    if (!isValidElement(node)) return undefined;
    const props = (node as ReactElement<Record<string, unknown>>).props;
    if (typeof props.action === "function") return props.action as (fd: FormData) => Promise<void>;
    return findAction(props.children as ReactNode);
  }

  it("lists staff with a role picker", async () => {
    supabase().respond("profiles", "select", { data: [{ id: "u2", full_name: "John Ade", role: "content_manager", created_at: "" }] });
    render(await UsersPage());
    expect(heading("Staff & Roles")).toBeInTheDocument();
    expect(screen.getByText("John Ade")).toBeInTheDocument();
    const select = document.querySelector('select[name="role"]') as HTMLSelectElement;
    expect(select.value).toBe("content_manager");
    expect([...select.options].map((o) => o.value)).toEqual(["super_admin", "church_staff", "content_manager"]);
  });

  it("saves the chosen role for that staff member", async () => {
    supabase().respond("profiles", "select", { data: [{ id: "u2", full_name: "John Ade", role: "content_manager", created_at: "" }] });
    const save = findAction(await UsersPage());
    await save!(form({ role: "church_staff" }));
    expect(updateUserRole).toHaveBeenCalledWith("u2", "church_staff");
  });

  it("shows an empty state", async () => {
    render(await UsersPage());
    expect(screen.getByText("No staff accounts yet.")).toBeInTheDocument();
  });
});
