import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as Icons from "@/components/icons";
import * as NavIcons from "@/components/admin/nav-icons";
import {
  AdminAlert,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminEmptyState,
  AdminFileInput,
  AdminInput,
  AdminLabel,
  AdminPageHeader,
  AdminSectionLabel,
  AdminSelect,
  AdminTable,
  AdminTHead,
  AdminTextarea,
} from "@/components/admin/ui";
import { Notice, QuietLink, SheetHeading, fieldClass, labelClass, primaryButtonClass } from "@/app/login/ui";
import { STATUS_TONE, formatDay, formatTime } from "@/app/admin/baptism-inquiries/format";
import { HeroContent, HeroScrim } from "@/components/hero-content";
import { PriestMessageCard } from "@/components/priest-message";
import { QuoteBanner } from "@/components/quote-banner";
import { PlaceholderImage } from "@/components/placeholder-image";
import { PastEventCard, UpcomingEventCard } from "@/components/event-cards";
import { ParishServices } from "@/components/parish-services";
import { CommunityGroups } from "@/components/community-groups";
import { HarvestFeature } from "@/components/harvest-feature";
import { SiteFooter } from "@/components/site-footer";
import { siteConfig } from "@/lib/site-config";
import { supabase } from "../helpers/supabase";
import { event, harvestPhoto, organization } from "../helpers/fixtures";

vi.mock("@/lib/compress-image", () => ({ compressImage: vi.fn(async (f: File) => f) }));
const { compressImage } = await import("@/lib/compress-image");
vi.mock("@/app/events/actions", () => ({ submitRsvp: vi.fn() }));

describe("icons", () => {
  const { LogoMark, ...svgIcons } = Icons;
  const all = { ...svgIcons, ...NavIcons } as Record<string, (p: { className?: string }) => React.ReactElement>;

  it("LogoMark is the brand emblem image, decorative", () => {
    const { container } = render(<LogoMark className="size-10" />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("src", "/brand/emblem-256.webp");
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveClass("size-10");
  });

  it.each(Object.keys(all))("%s renders an svg with the given class", (name) => {
    const { container } = render(all[name]({ className: "size-4 test-class" }));
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(container.innerHTML).toContain("test-class");
  });
});

describe("admin UI kit", () => {
  it("form fields merge their classes and forward props", () => {
    render(
      <>
        <AdminLabel htmlFor="t">Title</AdminLabel>
        <AdminInput id="t" name="title" className="w-1" placeholder="Title" />
        <AdminTextarea name="body" className="w-2" aria-label="Body" />
        <AdminSelect name="role" className="w-3" aria-label="Role">
          <option>a</option>
        </AdminSelect>
      </>,
    );
    expect(screen.getByLabelText("Title")).toHaveClass("w-1");
    expect(screen.getByLabelText("Title")).toHaveAttribute("name", "title");
    expect(screen.getByLabelText("Body")).toHaveClass("w-2");
    expect(screen.getByLabelText("Role")).toHaveClass("w-3");
  });

  it("buttons default to submit and support variants", () => {
    render(
      <form>
        <AdminButton>Save</AdminButton>
        <AdminButton variant="danger" type="button">
          Delete
        </AdminButton>
        <AdminButton disabled>Off</AdminButton>
      </form>,
    );
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "submit");
    expect(screen.getByRole("button", { name: "Delete" })).toHaveAttribute("type", "button");
    expect(screen.getByRole("button", { name: "Delete" }).className).toContain("text-red-400");
    expect(screen.getByRole("button", { name: "Off" })).toBeDisabled();
  });

  it("buttons disable while their form's action runs", async () => {
    let finish!: () => void;
    render(
      <form action={() => new Promise<void>((r) => (finish = r))}>
        <AdminButton>Save</AdminButton>
      </form>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("button", { name: "Save" })).toBeDisabled();
    finish();
  });

  it("layout pieces render their content", () => {
    render(
      <>
        <AdminPageHeader title="Events" description="Manage events" />
        <AdminSectionLabel>Upcoming</AdminSectionLabel>
        <AdminCard className="c">Card body</AdminCard>
        <AdminEmptyState>Nothing yet</AdminEmptyState>
        <AdminTable>
          <AdminTHead>
            <th>Name</th>
          </AdminTHead>
          <tbody />
        </AdminTable>
      </>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Events" })).toBeInTheDocument();
    expect(screen.getByText("Manage events")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Upcoming" })).toBeInTheDocument();
    expect(screen.getByText("Card body")).toHaveClass("c");
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
  });

  it("page header works without a description", () => {
    const { container } = render(<AdminPageHeader title="Only title" />);
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });

  it("badges and alerts change tone", () => {
    render(
      <>
        <AdminBadge>neutral</AdminBadge>
        <AdminBadge tone="warn">warn</AdminBadge>
        <AdminAlert>Failed</AdminAlert>
        <AdminAlert tone="success">Saved</AdminAlert>
      </>,
    );
    expect(screen.getByText("warn").className).toContain("amber");
    expect(screen.getByText("neutral").className).toContain("neutral");
    expect(screen.getByText("Failed").className).toContain("red");
    expect(screen.getByText("Saved").className).toContain("emerald");
  });

  describe("AdminFileInput", () => {
    function pick(input: HTMLInputElement, files: File[]) {
      return userEvent.upload(input, files);
    }

    it("leaves small images untouched", async () => {
      const onChange = vi.fn();
      const { container } = render(<AdminFileInput name="image" accept="image/*" onChange={onChange} />);
      const input = container.querySelector("input")!;
      await pick(input, [new File(["a"], "a.jpg", { type: "image/jpeg" })]);
      expect(onChange).toHaveBeenCalled();
      expect(compressImage).toHaveBeenCalled();
      expect(screen.queryByText(/resized/)).not.toBeInTheDocument();
      expect(input.validationMessage).toBe("");
    });

    it("swaps in the compressed file and says so", async () => {
      const small = new File(["b"], "a.webp", { type: "image/webp" });
      vi.mocked(compressImage).mockResolvedValueOnce(small);
      // jsdom has no DataTransfer; a minimal one is enough for this swap.
      vi.stubGlobal(
        "DataTransfer",
        class {
          private list: File[] = [];
          items = { add: (f: File) => this.list.push(f) };
          get files() {
            return Object.assign([...this.list], { item: (i: number) => this.list[i] }) as unknown as FileList;
          }
        },
      );
      const { container } = render(<AdminFileInput name="image" />);
      const input = container.querySelector("input")!;
      const setFiles = vi.fn();
      Object.defineProperty(input, "files", {
        configurable: true,
        get: () => Object.assign([new File(["big"], "a.jpg", { type: "image/jpeg" })], { item: () => null }),
        set: setFiles,
      });
      input.dispatchEvent(new Event("change", { bubbles: true }));

      expect(await screen.findByText("Image resized for the web — ready to upload.")).toBeInTheDocument();
      expect(setFiles).toHaveBeenCalled();
      expect((setFiles.mock.calls[0][0] as File[])[0]).toBe(small);
      vi.unstubAllGlobals();
    });

    it("falls back to the original if compression fails", async () => {
      vi.mocked(compressImage).mockRejectedValueOnce(new Error("decode"));
      const { container } = render(<AdminFileInput name="image" />);
      const input = container.querySelector("input")!;
      await pick(input, [new File(["a"], "a.jpg", { type: "image/jpeg" })]);
      expect(screen.queryByText(/Optimizing/)).not.toBeInTheDocument();
      expect(input.validationMessage).toBe("");
    });

    it("blocks submitting while it works", async () => {
      let finish!: (f: File) => void;
      vi.mocked(compressImage).mockImplementationOnce(() => new Promise((r) => (finish = r)));
      const { container } = render(<AdminFileInput name="image" />);
      const input = container.querySelector("input")!;
      const file = new File(["a"], "a.jpg", { type: "image/jpeg" });
      await pick(input, [file]);
      expect(await screen.findByText("Optimizing image…")).toBeInTheDocument();
      expect(input.validationMessage).toBe("Optimizing image — one moment…");
      finish(file);
      await vi.waitFor(() => expect(input.validationMessage).toBe(""));
    });

    it("resets when the selection is cleared", async () => {
      const { container } = render(<AdminFileInput name="image" />);
      const input = container.querySelector("input")!;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      expect(compressImage).not.toHaveBeenCalled();
    });
  });
});

describe("login UI", () => {
  it("exports shared class names", () => {
    for (const cls of [fieldClass, labelClass, primaryButtonClass]) expect(cls.length).toBeGreaterThan(0);
  });

  it("renders the sheet heading", () => {
    render(<SheetHeading title="Sign in">For parish staff only.</SheetHeading>);
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByText("For parish staff only.")).toBeInTheDocument();
  });

  it("announces errors as alerts and successes as status", () => {
    render(
      <>
        <Notice tone="error">Wrong password</Notice>
        <Notice tone="success">Link sent</Notice>
      </>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Wrong password");
    expect(screen.getByRole("status")).toHaveTextContent("Link sent");
  });

  it("renders a quiet back link", () => {
    render(<QuietLink href="/">Back to website</QuietLink>);
    expect(screen.getByRole("link", { name: /Back to website/ })).toHaveAttribute("href", "/");
  });
});

describe("baptism request format helpers", () => {
  it("maps every status to a badge tone", () => {
    expect(STATUS_TONE).toEqual({ pending: "warn", contacted: "neutral", scheduled: "brand", closed: "success" });
  });

  it("formats a date as a short British day", () => {
    expect(formatDay("2026-08-02")).toBe("Sun, 2 Aug 2026");
  });

  it("formats times in 12-hour clock", () => {
    expect(formatTime("10:00:00")).toBe("10:00 am");
    expect(formatTime("17:30")).toBe("5:30 pm");
    expect(formatTime("00:05:00")).toBe("12:05 am");
    expect(formatTime(null)).toBe("");
  });
});

describe("HeroContent", () => {
  it("shows the copy and the two calls to action", () => {
    render(<HeroContent heading="Welcome" subheading="Join us" />);
    expect(screen.getByRole("heading", { level: 1, name: "Welcome" })).toBeInTheDocument();
    expect(screen.getByText("Join us")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mass Times" })).toHaveAttribute("href", "/mass-schedule");
    expect(screen.getByRole("link", { name: "Upcoming Events" })).toHaveAttribute("href", "/events");
  });

  it("renders the scrim layers", () => {
    const { container } = render(<HeroScrim />);
    expect(container.children).toHaveLength(2);
  });
});

describe("PriestMessageCard", () => {
  it("leads with the first paragraph and lists the rest", () => {
    render(<PriestMessageCard heading="A Message" paragraphs={["Lead.", "Second.", "Third."]} />);
    expect(screen.getByRole("heading", { name: "A Message" })).toBeInTheDocument();
    expect(screen.getByText("Lead.").className).toContain("text-xl");
    expect(screen.getByText("Second.")).toBeInTheDocument();
    expect(screen.getByText("Third.")).toBeInTheDocument();
    expect(screen.getByText("The Parish Priest")).toBeInTheDocument();
  });

  it("handles a single paragraph", () => {
    render(<PriestMessageCard heading="H" paragraphs={["Only."]} />);
    expect(screen.getByText("Only.")).toBeInTheDocument();
  });
});

describe("QuoteBanner", () => {
  it("renders a title and its content", () => {
    render(
      <QuoteBanner title="Our Faith">
        <p>Body text</p>
      </QuoteBanner>,
    );
    expect(screen.getByRole("heading", { name: "Our Faith" })).toBeInTheDocument();
    expect(screen.getByText("Body text")).toBeInTheDocument();
  });
});

describe("PlaceholderImage", () => {
  it("shows the real photo when its file exists", () => {
    render(<PlaceholderImage slot="home/baptism" label="Baptism" className="h-1" />);
    expect(screen.getByRole("img", { name: "Baptism" })).toHaveAttribute("src", "/images/home/baptism.jpg");
  });

  it("shows a labelled placeholder with instructions otherwise", () => {
    render(<PlaceholderImage slot="missing/slot" label="Hero photo" />);
    expect(screen.getByText("Hero photo")).toBeInTheDocument();
    expect(screen.getByText("Add public/images/missing/slot.jpg")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

describe("UpcomingEventCard", () => {
  it("shows the date badge, countdown, details and RSVP", () => {
    render(<UpcomingEventCard event={event()} />);
    expect(screen.getByText("Jul")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("In 2 weeks")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Parish Feast Day" })).toBeInTheDocument();
    expect(screen.getByText("Wed, 10:00 AM")).toBeInTheDocument();
    expect(screen.getByText("Main Church")).toBeInTheDocument();
    expect(screen.getByText("Mass followed by a reception.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^RSVP/ })).toBeInTheDocument();
  });

  it("leaves out optional details", () => {
    render(<UpcomingEventCard event={event({ event_time: null, location: null, description: null })} />);
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.queryByText("Main Church")).not.toBeInTheDocument();
  });

  it("fills the featured card with brand green", () => {
    render(<UpcomingEventCard event={event()} featured />);
    expect(screen.getByRole("article").className).toContain("bg-brand-600");
  });
});

describe("PastEventCard", () => {
  it("links to the event with its cover and photo count", () => {
    const { container } = render(<PastEventCard event={event({ id: "e9" })} coverSrc="/c.jpg" photoCount={3} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/events/e9");
    expect(container.querySelector('img[src="/c.jpg"]')).not.toBeNull();
    expect(screen.getByText("3 photos")).toBeInTheDocument();
  });

  it("uses a typographic poster without a cover and the singular for one photo", () => {
    const { container } = render(<PastEventCard event={event()} coverSrc={null} photoCount={1} />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getAllByText("Parish Feast Day")).toHaveLength(2);
    expect(screen.getByText("1 photo")).toBeInTheDocument();
  });

  it("hides the photo count when there are none", () => {
    render(<PastEventCard event={event({ location: null })} coverSrc={null} photoCount={0} />);
    expect(screen.queryByText(/photo/)).not.toBeInTheDocument();
  });
});

describe("ParishServices", () => {
  it("offers the three services, each with what happens next", () => {
    render(<ParishServices />);
    expect(screen.getByRole("heading", { level: 2, name: "The parish office, open online" })).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/mass-booking", "/baptism-request", "/harvest"]);
    expect(within(links[0]).getByRole("heading", { name: "Book a Mass" })).toBeInTheDocument();
    expect(within(links[2]).getByText(/Nothing is paid on the website/)).toBeInTheDocument();
    expect(screen.getAllByText("What happens next:")).toHaveLength(3);
  });
});

describe("CommunityGroups", () => {
  it("lists the parish's real groups with meeting times, linking to each", () => {
    render(<CommunityGroups groups={[organization({ id: "o1", name: "CYON", meeting_schedule: "Sundays 4pm" })]} />);
    const row = screen.getByRole("link", { name: /CYON/ });
    expect(row).toHaveAttribute("href", "/organizations#org-o1");
    expect(within(row).getByText("Sundays 4pm")).toBeInTheDocument();
  });

  it("shows at most seven and links to the rest", () => {
    const groups = Array.from({ length: 9 }, (_, i) => organization({ id: `o${i}`, name: `Group ${i}` }));
    render(<CommunityGroups groups={groups} />);
    expect(screen.getByText("Group 6")).toBeInTheDocument();
    expect(screen.queryByText("Group 7")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /And 2 more groups/ })).toHaveAttribute("href", "/organizations");
  });

  it("uses the singular for one extra group", () => {
    const groups = Array.from({ length: 8 }, (_, i) => organization({ id: `o${i}`, name: `Group ${i}` }));
    render(<CommunityGroups groups={groups} />);
    expect(screen.getByRole("link", { name: /And 1 more group$/ })).toBeInTheDocument();
  });

  it.each([null, []])("falls back to the parish's named groups when there are none (%s)", (groups) => {
    render(<CommunityGroups groups={groups} />);
    expect(screen.getByText("Catholic Women Organization (CWO)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /CYON/ })).toHaveAttribute("href", "/organizations");
    expect(screen.queryByText(/more group/)).not.toBeInTheDocument();
  });

  it("invites people in and gives the office phone number", () => {
    render(<CommunityGroups groups={null} />);
    expect(screen.getByRole("heading", { name: "Be part of our community" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore all groups/ })).toHaveAttribute("href", "/organizations");
    expect(screen.getByRole("link", { name: siteConfig.phones[0] })).toHaveAttribute(
      "href",
      `tel:${siteConfig.phones[0].replace(/\s+/g, "")}`,
    );
  });
});

describe("HarvestFeature", () => {
  it("explains the three pledge steps and links to pledge", () => {
    render(<HarvestFeature photos={null} />);
    expect(screen.getByRole("heading", { name: "Annual Harvest Celebration" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Make a Pledge" })).toHaveAttribute("href", "/harvest#pledge");
  });

  it("uses uploaded harvest photos when there are some", () => {
    const { container } = render(
      <HarvestFeature photos={[harvestPhoto({ image_url: "/h1.jpg" }), harvestPhoto({ id: "2", image_url: "/h2.jpg" })]} />,
    );
    expect(container.querySelector('img[src="/h1.jpg"]')).not.toBeNull();
    expect(container.querySelector('img[src="/h2.jpg"]')).not.toBeNull();
  });

  it("falls back to placeholders without photos", () => {
    render(<HarvestFeature photos={[]} />);
    expect(screen.getAllByText("Harvest photo").length).toBeGreaterThan(0);
  });
});

describe("SiteFooter", () => {
  it("shows contact details and live Mass times", async () => {
    // Postgres returns time columns with seconds; the footer shouldn't.
    supabase().respond("mass_schedule", "select", {
      data: [
        { id: "1", day_type: "sunday", time: "07:00:00", label: "First Mass" },
        { id: "2", day_type: "sunday", time: "09:00:00", label: null },
        { id: "3", day_type: "weekday", time: "06:30:00", label: null },
        { id: "4", day_type: "weekday", time: "18:00:00", label: null },
      ],
    });
    render(await SiteFooter());
    expect(screen.getByText("Monday – Friday: 6:30 am, 6:00 pm")).toBeInTheDocument();
    expect(screen.getByText("Sunday: 7:00 am (First Mass)")).toBeInTheDocument();
    expect(screen.getByText("Sunday: 9:00 am")).toBeInTheDocument();
    expect(screen.queryByText(/:00:00/)).not.toBeInTheDocument();
    expect(screen.getAllByText(siteConfig.email).length).toBeGreaterThan(0);
    expect(screen.getByText(/© 2026/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Groups & Societies" })).toHaveAttribute("href", "/organizations");
  });

  it("says when the schedule isn't set up", async () => {
    render(await SiteFooter());
    expect(screen.getByText("Schedule not set up yet.")).toBeInTheDocument();
  });

  it("only asks for regular Sunday and weekday Masses", async () => {
    render(await SiteFooter());
    expect(supabase().callsTo("mass_schedule")[0].filters).toContainEqual(["in", ["day_type", ["sunday", "weekday"]]]);
  });
});
