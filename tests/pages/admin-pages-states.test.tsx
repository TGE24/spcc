// State variations on admin and public pages that the main page suites
// don't reach: covers, past vs upcoming, live vs scheduled announcements,
// special Masses, unsaved singletons, and related past events.
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import EditEventPage from "@/app/admin/events/[id]/page";
import AnnouncementsPage from "@/app/admin/announcements/page";
import AdminMassSchedulePage from "@/app/admin/mass-schedule/page";
import PriestMessagePage from "@/app/admin/priest-message/page";
import HistoryPage from "@/app/admin/history/page";
import PastEventPage from "@/app/events/[id]/page";
import { supabase } from "../helpers/supabase";
import { event } from "../helpers/fixtures";

vi.mock("@/components/site-footer", () => ({ SiteFooter: () => <footer /> }));

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const search = <T extends object>(sp: T) => ({ searchParams: Promise.resolve(sp) });

describe("Edit event page", () => {
  it("explains an upcoming event and offers no write-up shortcut", async () => {
    supabase().respond("events", "select", { data: event() });
    render(await EditEventPage({ ...params("evt-1"), ...search({}) }));
    expect(screen.getByText(/This event is upcoming/)).toBeInTheDocument();
    expect(screen.queryByAltText("Current cover")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Manage photos/ })).toHaveAttribute("href", "/admin/events/evt-1/photos");
  });

  it("shows the current cover with a remove option, and explains a past event", async () => {
    supabase().respond("events", "select", {
      data: event({ event_date: "2026-03-01", cover_image_url: "/cover.jpg", recap: "Lovely day." }),
    });
    render(await EditEventPage({ ...params("evt-1"), ...search({ error: "Saving failed" }) }));
    expect(screen.getByText(/This event is past/)).toBeInTheDocument();
    expect(screen.getByAltText("Current cover")).toHaveAttribute("src", "/cover.jpg");
    expect(screen.getByLabelText("Remove cover photo")).toHaveAttribute("name", "remove_cover");
    expect(screen.getByText("Saving failed")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Lovely day.")).toBeInTheDocument();
  });
});

describe("Announcements page", () => {
  it("marks live announcements and shows their window", async () => {
    supabase().respond("announcements", "select", {
      data: [
        { id: "a", title: "Live one", body: null, active_from: "2026-06-01T00:00:00Z", active_to: "2026-06-30T23:59:59Z", created_at: "" },
        { id: "b", title: "Future one", body: "Soon", active_from: "2026-07-01T00:00:00Z", active_to: null, created_at: "" },
        { id: "c", title: "Expired one", body: null, active_from: "2026-05-01T00:00:00Z", active_to: "2026-05-02T00:00:00Z", created_at: "" },
      ],
    });
    render(await AnnouncementsPage());
    const card = (title: string) => screen.getByRole("heading", { name: title }).closest("div")!.parentElement!;
    expect(within(card("Live one")).getByText("Live now")).toBeInTheDocument();
    expect(within(card("Future one")).queryByText("Live now")).not.toBeInTheDocument();
    expect(within(card("Future one")).getByText(/no end date/)).toBeInTheDocument();
    expect(within(card("Expired one")).queryByText("Live now")).not.toBeInTheDocument();
  });
});

describe("Admin Mass schedule page", () => {
  it("shows special Masses by date and name, and an empty state", async () => {
    supabase().respond("mass_schedule", "select", {
      data: [{ id: "x", day_type: "special", time: "00:00:00", label: null, special_date: "2026-12-25", special_name: "Christmas", created_at: "" }],
    });
    const first = render(await AdminMassSchedulePage());
    expect(screen.getByText("Friday, 25 December 2026 — Christmas")).toBeInTheDocument();
    expect(screen.getByText("12:00 am")).toBeInTheDocument();
    first.unmount();

    supabase().respond("mass_schedule", "select", { data: [] });
    render(await AdminMassSchedulePage());
    expect(screen.getAllByRole("row").length).toBeGreaterThan(1);
  });
});

describe("Single-row editors before anything is saved", () => {
  it("priest's message starts blank with no id", async () => {
    render(await PriestMessagePage());
    expect(document.querySelector('input[name="id"]')).toHaveValue("");
    expect(document.querySelector('textarea[name="message"]')).toHaveValue("");
  });

  it("parish history starts blank with no id", async () => {
    render(await HistoryPage());
    expect(document.querySelector('input[name="id"]')).toHaveValue("");
  });

  it("parish history pre-fills the founding details", async () => {
    supabase().respond("parish_history", "select", {
      data: { id: "h", content: "x", founding_date: "1960-03-17", founding_priest: "Fr. Kelly", updated_at: "" },
    });
    render(await HistoryPage());
    expect(screen.getByDisplayValue("1960-03-17")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Fr. Kelly")).toBeInTheDocument();
  });
});

describe("Past event page: related events", () => {
  it("lists other past events, each covered by its earliest photo", async () => {
    supabase()
      .respond(
        "events",
        "select",
        { data: event({ id: "p1", title: "Lent Retreat", event_date: "2026-03-01" }) },
        {
          data: [
            {
              ...event({ id: "p2", title: "Easter Vigil", event_date: "2026-04-04" }),
              event_photos: [
                { image_url: "/late.jpg", created_at: "2026-04-05T10:00:00Z" },
                { image_url: "/early.jpg", created_at: "2026-04-04T20:00:00Z" },
              ],
            },
          ],
        },
      )
      .respond("event_photos", "select", { data: [] });
    render(await PastEventPage(params("p1-related")));
    const more = screen.getByRole("heading", { name: "More past events" }).parentElement!;
    expect(within(more).getByRole("link")).toHaveAttribute("href", "/events/p2");
    expect(more.querySelector('img[src="/early.jpg"]')).not.toBeNull();
    expect(within(more).getByText("2 photos")).toBeInTheDocument();
  });

  it("uses the description alone and mentions photos when there's no recap", async () => {
    supabase()
      .respond("events", "select", { data: event({ id: "p3", event_date: "2026-03-01", description: null, recap: null }) }, { data: [] })
      .respond("event_photos", "select", { data: [{ id: "a", event_id: "p3", image_url: "/a.jpg", created_at: "" }] });
    render(await PastEventPage(params("p3-photos")));
    expect(screen.getByText("A few moments from the day are below.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "1 photo" })).toBeInTheDocument();
  });
});
