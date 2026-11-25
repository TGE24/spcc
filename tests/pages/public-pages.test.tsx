// Public pages, rendered as React would on the server: each async page is
// awaited and its output rendered into jsdom.
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import HomePage from "@/app/page";
import AboutPage from "@/app/about/page";
import EventsPage from "@/app/events/page";
import PastEventPage, { generateMetadata } from "@/app/events/[id]/page";
import MassSchedulePage from "@/app/mass-schedule/page";
import HomiliesPage from "@/app/homilies/page";
import OrganizationsPage from "@/app/organizations/page";
import ProjectsPage from "@/app/projects/page";
import HarvestPage from "@/app/harvest/page";
import MassBookingPage from "@/app/mass-booking/page";
import BaptismRequestPage from "@/app/baptism-request/page";
import { supabase } from "../helpers/supabase";
import { expectNotFound, redirectTarget } from "../helpers/next";
import { event, harvestPhoto, heroSlide, homily, organization } from "../helpers/fixtures";

// The footer is an async Server Component with its own tests; client-side
// rendering can't await it inside another tree.
vi.mock("@/components/site-footer", () => ({ SiteFooter: () => <footer>footer</footer> }));
vi.mock("@/app/events/actions", () => ({ submitRsvp: vi.fn() }));

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const search = <T extends object>(sp: T) => ({ searchParams: Promise.resolve(sp) });

describe("Home page", () => {
  it("shows the placeholder hero and empty states on a fresh database", async () => {
    render(await HomePage());
    expect(screen.getByRole("heading", { level: 1, name: "Welcome to Our Parish Family" })).toBeInTheDocument();
    expect(screen.getByText(/Nothing on the calendar just yet/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The parish office, open online" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Be part of our community" })).toBeInTheDocument();
    expect(screen.queryByText("A Message from the Parish Priest")).not.toBeInTheDocument();
    expect(screen.queryByText("Latest Sermons")).not.toBeInTheDocument();
  });

  it("shows live content when it's been added", async () => {
    supabase()
      .respond("events", "select", { data: [event(), event({ id: "e2", title: "Youth Rally" })] })
      .respond("announcements", "select", { data: [{ id: "a", title: "Parish picnic", body: "Sunday after Mass" }] })
      .respond("homilies", "select", { data: [homily()] })
      .respond("hero_slides", "select", { data: [heroSlide({ heading: "Christ is Risen" })] })
      .respond("priest_message", "select", { data: { heading: "", message: "Welcome home.\nWe pray for you." } })
      .respond("harvest_photos", "select", { data: [harvestPhoto()] })
      .respond("hero_settings", "select", { data: { heading: "Custom default", subheading: null } })
      .respond("organizations", "select", { data: [organization({ name: "CYON" })] });

    render(await HomePage());
    expect(screen.getByText("Parish picnic")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Christ is Risen" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A Message from the Parish Priest" })).toBeInTheDocument();
    expect(screen.getByText("We pray for you.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Parish Feast Day" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Youth Rally" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The Good Shepherd" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /CYON/ })).toBeInTheDocument();
  });

  it("asks only for upcoming events and active announcements", async () => {
    render(await HomePage());
    const db = supabase();
    expect(db.callsTo("events")[0].filters).toContainEqual(["gte", ["event_date", "2026-06-15"]]);
    expect(db.callsTo("announcements")[0].filters).toContainEqual(["lte", ["active_from", "2026-06-15T12:00:00.000Z"]]);
  });

  it("still renders when Supabase is unreachable", async () => {
    const db = supabase();
    const down = () => {
      throw new Error("fetch failed");
    };
    for (const table of ["events", "announcements", "homilies", "hero_slides", "priest_message", "harvest_photos", "hero_settings", "organizations"]) {
      db.respond(table, "*", down);
    }
    render(await HomePage());
    expect(screen.getByRole("heading", { level: 1, name: "Welcome to Our Parish Family" })).toBeInTheDocument();
    expect(screen.getByText("Catholic Women Organization (CWO)")).toBeInTheDocument();
  });
});

describe("About page", () => {
  it("shows the parish history and groups", async () => {
    supabase()
      .respond("parish_history", "select", {
        data: { content: "Founded by missionaries.\nGrew quickly.", founding_date: "1960-03-17", founding_priest: "Fr. Kelly" },
      })
      .respond("organizations", "select", { data: [organization({ name: "Choir" })] });
    render(await AboutPage());
    expect(screen.getByRole("heading", { level: 1, name: "About Our Parish" })).toBeInTheDocument();
    expect(screen.getByText("Founded by missionaries.")).toBeInTheDocument();
    expect(screen.getByText("Grew quickly.")).toBeInTheDocument();
    expect(screen.getByText(/by Fr\. Kelly/)).toBeInTheDocument();
    expect(screen.getAllByText("Choir").length).toBeGreaterThan(0);
  });

  it("renders without any history saved", async () => {
    render(await AboutPage());
    expect(screen.getByRole("heading", { level: 1, name: "About Our Parish" })).toBeInTheDocument();
  });
});

describe("Events page", () => {
  it("splits events into upcoming and past, newest past first, grouped by year", async () => {
    supabase().respond("events", "select", {
      data: [
        event({ id: "p1", title: "Easter Vigil 2025", event_date: "2025-04-19", event_photos: [] } as never),
        event({ id: "p2", title: "Lent Retreat", event_date: "2026-03-01", event_photos: [{ image_url: "/b.jpg", created_at: "2" }, { image_url: "/a.jpg", created_at: "1" }] } as never),
        event({ id: "u1", title: "Feast Day", event_date: "2026-07-01", event_photos: [] } as never),
      ],
    });
    render(await EventsPage());
    expect(screen.getByRole("link", { name: /Upcoming 1/ })).toHaveAttribute("href", "#upcoming");
    expect(screen.getByRole("link", { name: /Past 2/ })).toHaveAttribute("href", "#past");

    const past = document.getElementById("past")!;
    const titles = within(past).getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["2026", "Lent Retreat", "2025", "Easter Vigil 2025"]);
    expect(past.querySelector('img[src="/a.jpg"]')).not.toBeNull();
    expect(within(past).getByText("2 photos")).toBeInTheDocument();
  });

  it("shows empty states", async () => {
    render(await EventsPage());
    expect(screen.getByText(/Nothing on the calendar just yet/)).toBeInTheDocument();
    expect(screen.getByText(/Once an event has taken place/)).toBeInTheDocument();
  });

  it("drops the year headings when all past events share a year", async () => {
    supabase().respond("events", "select", {
      data: [event({ id: "p", title: "Lent Retreat", event_date: "2026-03-01", event_photos: [] } as never)],
    });
    render(await EventsPage());
    expect(within(document.getElementById("past")!).queryByText("2026")).not.toBeInTheDocument();
  });
});

describe("Past event page", () => {
  const past = event({ id: "p1", title: "Lent Retreat", event_date: "2026-03-01", recap: "A blessed day.\n\nThank you all." });

  it("shows the recap, facts and gallery", async () => {
    supabase()
      .respond("events", "select", { data: past }, { data: [] })
      .respond("event_photos", "select", {
        data: [
          { id: "ph1", image_url: "/1.jpg", event_id: "p1", created_at: "" },
          { id: "ph2", image_url: "/2.jpg", event_id: "p1", created_at: "" },
        ],
      });
    render(await PastEventPage(params("p1")));
    expect(screen.getByRole("heading", { level: 1, name: "Lent Retreat" })).toBeInTheDocument();
    expect(screen.getByText("A blessed day.")).toBeInTheDocument();
    expect(screen.getByText("Thank you all.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "2 photos" })).toHaveAttribute("href", "#photos");
    expect(screen.getByRole("img", { name: "Lent Retreat, photo 1 of 2" })).toBeInTheDocument();
  });

  it("thanks people when there's no write-up", async () => {
    supabase().respond("events", "select", { data: { ...past, description: null, recap: null } }, { data: [] });
    render(await PastEventPage(params("p1")));
    expect(screen.getByText("Thank you to everyone who joined us.")).toBeInTheDocument();
  });

  it("is a 404 for an unknown event", async () => {
    await expectNotFound(PastEventPage(params("missing")));
  });

  it("sends upcoming events back to the events list", async () => {
    supabase().respond("events", "select", { data: event({ event_date: "2026-07-01" }) });
    expect(await redirectTarget(PastEventPage(params("evt-1")))).toBe("/events#upcoming");
  });

  describe("generateMetadata", () => {
    it("describes a past event from its recap", async () => {
      supabase().respond("events", "select", { data: { ...past, cover_image_url: "/cover.jpg" } });
      const meta = await generateMetadata(params("p1-meta"));
      expect(meta.title).toBe("Lent Retreat");
      expect(meta.description).toBe("A blessed day.\n\nThank you all.");
      expect(meta.alternates?.canonical).toBe("/events/p1");
      expect(meta.openGraph?.images).toEqual(["/cover.jpg"]);
    });

    it("caps the description at 160 characters", async () => {
      supabase().respond("events", "select", { data: { ...past, id: "long", recap: "x".repeat(300) } });
      expect(((await generateMetadata(params("long-meta"))).description as string).length).toBe(160);
    });

    it("falls back to the date when there's no text", async () => {
      supabase().respond("events", "select", { data: { ...past, recap: null, description: null } });
      expect((await generateMetadata(params("date-meta"))).description).toBe("Sunday, March 1, 2026");
    });

    it("hides upcoming and missing events", async () => {
      expect((await generateMetadata(params("nope"))).title).toBe("Event not found");
      supabase().respond("events", "select", { data: event() });
      expect((await generateMetadata(params("upcoming-meta"))).title).toBe("Event not found");
    });
  });
});

describe("Mass schedule page", () => {
  it("shows readable times grouped by kind of day", async () => {
    supabase().respond("mass_schedule", "select", {
      data: [
        { id: "1", day_type: "weekday", time: "06:30:00", label: "Morning Mass", special_date: null, special_name: null },
        { id: "2", day_type: "sunday", time: "07:00:00", label: "First Mass", special_date: null, special_name: null },
        { id: "3", day_type: "sunday", time: "09:00:00", label: null, special_date: null, special_name: null },
        { id: "4", day_type: "special", time: "00:00:00", label: null, special_date: "2026-12-25", special_name: "Christmas" },
      ],
    });
    render(await MassSchedulePage());
    expect(screen.getByRole("heading", { level: 1, name: "Mass Schedule for this week" })).toBeInTheDocument();
    expect(screen.getByText("6:30 am / Venue: Church Auditorium")).toBeInTheDocument();
    expect(screen.getByText("6:30 am (Morning Mass)")).toBeInTheDocument();
    // A label replaces the ordinal rather than repeating it.
    expect(screen.getByText("First Mass: 7:00 am")).toBeInTheDocument();
    expect(screen.getByText("Second Mass: 9:00 am")).toBeInTheDocument();
    expect(screen.getByText("Friday, 25 December 2026 — Christmas (12:00 am)")).toBeInTheDocument();
    expect(screen.queryByText(/\d:\d\d:\d\d/)).not.toBeInTheDocument();
  });

  it("renders with nothing scheduled", async () => {
    render(await MassSchedulePage());
    expect(screen.getByRole("heading", { level: 2, name: "Weekday Mass" })).toBeInTheDocument();
    expect(screen.getAllByText("Not set up yet — add times in the admin dashboard.")).toHaveLength(2);
  });
});

describe("Homilies page", () => {
  const homilies = [
    homily({ id: "1", title: "Advent Hope", date: "2025-12-01", priest_name: "Fr. Paul" }),
    homily({ id: "2", title: "Easter Joy", date: "2026-04-05", priest_name: "Fr. John" }),
    homily({ id: "3", title: "Pentecost", date: "2026-05-24", priest_name: null }),
  ];

  it("lists every homily", async () => {
    supabase().respond("homilies", "select", { data: homilies });
    render(await HomiliesPage(search({})));
    for (const title of ["Advent Hope", "Easter Joy", "Pentecost"]) expect(screen.getByText(title)).toBeInTheDocument();
  });

  it("filters by priest", async () => {
    supabase().respond("homilies", "select", { data: homilies });
    render(await HomiliesPage(search({ priest: "Fr. John" })));
    expect(screen.getByText("Easter Joy")).toBeInTheDocument();
    expect(screen.queryByText("Advent Hope")).not.toBeInTheDocument();
  });

  it("filters by year", async () => {
    supabase().respond("homilies", "select", { data: homilies });
    render(await HomiliesPage(search({ year: "2025" })));
    expect(screen.getByText("Advent Hope")).toBeInTheDocument();
    expect(screen.queryByText("Easter Joy")).not.toBeInTheDocument();
  });

  it("offers the priests and years that exist as filter options", async () => {
    supabase().respond("homilies", "select", { data: homilies });
    render(await HomiliesPage(search({})));
    const options = [...document.querySelectorAll("option")].map((o) => o.textContent);
    expect(options).toEqual(expect.arrayContaining(["Fr. John", "Fr. Paul", "2026", "2025"]));
  });

  it("explains an empty result", async () => {
    supabase().respond("homilies", "select", { data: homilies });
    render(await HomiliesPage(search({ priest: "Fr. Nobody" })));
    expect(screen.getByText("No homilies match those filters.")).toBeInTheDocument();
  });

  it("says when nothing has been posted", async () => {
    render(await HomiliesPage(search({})));
    expect(screen.getByText("No homilies posted yet — check back soon.")).toBeInTheDocument();
  });
});

describe("Organizations page", () => {
  it("shows each group's details with an anchor for deep links", async () => {
    supabase().respond("organizations", "select", { data: [organization({ id: "o1" })] });
    render(await OrganizationsPage());
    expect(screen.getByRole("heading", { name: "Catholic Women Organization" })).toBeInTheDocument();
    expect(document.getElementById("org-o1")).not.toBeNull();
    expect(screen.getByText("First Sunday after 9am Mass")).toBeInTheDocument();
    expect(screen.getByText("Come to a meeting.")).toBeInTheDocument();
  });

  it("names the known groups before any are added", async () => {
    render(await OrganizationsPage());
    expect(screen.getByText(/Catholic Women Organization \(CWO\)/)).toBeInTheDocument();
  });
});

describe("Projects page", () => {
  it("lists projects", async () => {
    supabase().respond("projects", "select", {
      data: [{ id: "p", title: "New roof", description: "Replacing the roof", budget_details: "₦2m", progress_update: "Started", created_at: "" }],
    });
    render(await ProjectsPage());
    expect(screen.getByRole("heading", { name: "New roof" })).toBeInTheDocument();
    expect(screen.getByText("Replacing the roof")).toBeInTheDocument();
  });

  it("shows an empty state", async () => {
    render(await ProjectsPage());
    expect(screen.getByText("No projects posted yet — check back soon.")).toBeInTheDocument();
  });
});

describe("Form pages", () => {
  it("Mass booking: form, success and error states", async () => {
    const { unmount } = render(await MassBookingPage(search({})));
    expect(screen.getByRole("heading", { level: 1, name: "Book a Mass Intention" })).toBeInTheDocument();
    for (const name of ["full_name", "email", "phone", "intention_type", "preferred_date", "message"]) {
      expect(document.querySelector(`[name="${name}"]`)).not.toBeNull();
    }
    unmount();

    const success = render(await MassBookingPage(search({ success: "1" })));
    expect(screen.getByText(/your Mass intention request has been submitted/)).toBeInTheDocument();
    success.unmount();

    const failed = render(await MassBookingPage(search({ success: "1", email: "failed" })));
    expect(screen.getByText(/couldn’t send a confirmation email/)).toBeInTheDocument();
    failed.unmount();

    render(await MassBookingPage(search({ error: "Something went wrong" })));
    expect(screen.queryByText(/couldn’t send a confirmation email/)).not.toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("Harvest: pledge form, success, error and highlights", async () => {
    supabase().respond("harvest_photos", "select", { data: [harvestPhoto({ image_url: "/h.jpg" })] });
    const { unmount } = render(await HarvestPage(search({})));
    expect(screen.getByRole("heading", { level: 1, name: "Annual Harvest & Thanksgiving" })).toBeInTheDocument();
    expect(document.querySelector('[name="pledger_name"]')).toBeRequired();
    expect([...document.querySelectorAll('[name="category"] option')].map((o) => (o as HTMLOptionElement).value)).toEqual([
      "family",
      "group",
      "society",
    ]);
    unmount();

    const success = render(await HarvestPage(search({ success: "1" })));
    expect(screen.getByText("Thank you for your pledge — the parish office will be in touch.")).toBeInTheDocument();
    success.unmount();

    render(await HarvestPage(search({ error: "Try again" })));
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("Baptism request: every section of the paper form, with date limits", async () => {
    render(await BaptismRequestPage(search({})));
    expect(screen.getByRole("heading", { level: 1, name: "Request Your Child’s Baptism" })).toBeInTheDocument();
    for (const legend of ["The child", "The family", "Godparents", "How we'll reach you", "The baptism"]) {
      expect(screen.getByRole("group", { name: legend })).toBeInTheDocument();
    }
    expect(document.querySelector('[name="child_date_of_birth"]')).toHaveAttribute("max", "2026-06-15");
    expect(document.querySelector('[name="preferred_date"]')).toHaveAttribute("min", "2026-06-15");
    expect(document.querySelector('[name="family_name"]')).toBeRequired();
    expect(document.querySelector('[name="email"]')).toBeRequired();
  });

  it("Baptism request: success and error messages", async () => {
    const success = render(await BaptismRequestPage(search({ success: "1" })));
    expect(screen.getByRole("status")).toHaveTextContent("Your baptism request has been sent to the parish office.");
    success.unmount();

    const failed = render(await BaptismRequestPage(search({ success: "1", email: "failed" })));
    expect(screen.getByRole("status")).toHaveTextContent("Please call the parish office");
    failed.unmount();

    render(await BaptismRequestPage(search({ error: "Please enter the child's family name." })));
    expect(screen.getByRole("alert")).toHaveTextContent("Please enter the child's family name.");
  });
});
