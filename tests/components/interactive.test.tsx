import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { RsvpDialog } from "@/components/rsvp-dialog";
import { HeroSlider } from "@/components/hero-slider";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { heroSlide } from "../helpers/fixtures";

vi.mock("@/app/events/actions", () => ({ submitRsvp: vi.fn() }));
const { submitRsvp } = await import("@/app/events/actions");

describe("RsvpDialog", () => {
  beforeEach(() => {
    vi.mocked(submitRsvp).mockReset();
  });

  function setup() {
    render(<RsvpDialog eventId="evt-1" eventTitle="Parish Feast" dateLabel="Wednesday, July 1, 2026" />);
    return { trigger: screen.getByRole("button", { name: /^RSVP\s*to Parish Feast$/ }) };
  }

  it("names the event for screen readers on the trigger", () => {
    setup();
    expect(screen.getByRole("button", { name: /^RSVP\s*to Parish Feast$/ })).toBeInTheDocument();
  });

  it("opens a dialog with the event, date and form", async () => {
    const { trigger } = setup();
    await userEvent.click(trigger);
    const dialog = document.querySelector("dialog")!;
    expect(dialog).toHaveAttribute("open");
    expect(within(dialog).getByRole("heading", { name: "Parish Feast" })).toBeInTheDocument();
    expect(within(dialog).getByText("Wednesday, July 1, 2026")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Your name")).toBeRequired();
    expect(within(dialog).getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(dialog.querySelector('input[name="event_id"]')).toHaveValue("evt-1");
  });

  it("submits and shows a personal confirmation", async () => {
    vi.mocked(submitRsvp).mockResolvedValue({ status: "success", name: "Ada", emailed: true });
    const { trigger } = setup();
    await userEvent.click(trigger);
    await userEvent.type(screen.getByLabelText("Your name"), "Ada Obi");
    await userEvent.type(screen.getByLabelText("Email"), "ada@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Confirm RSVP" }));

    expect(await screen.findByText("See you there, Ada.")).toBeInTheDocument();
    expect(screen.getByText(/We’ve emailed you the details/)).toBeInTheDocument();
    const [, fd] = vi.mocked(submitRsvp).mock.calls[0];
    expect(Object.fromEntries(fd as FormData)).toEqual({
      event_id: "evt-1",
      full_name: "Ada Obi",
      email: "ada@example.com",
    });
  });

  it("says when the details couldn't be emailed", async () => {
    vi.mocked(submitRsvp).mockResolvedValue({ status: "success", name: "Ada", emailed: false });
    const { trigger } = setup();
    await userEvent.click(trigger);
    await userEvent.type(screen.getByLabelText("Your name"), "Ada");
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.click(screen.getByRole("button", { name: "Confirm RSVP" }));
    expect(await screen.findByText(/We couldn’t email you the details, but your place is saved/)).toBeInTheDocument();
  });

  it("shows the server's error message", async () => {
    vi.mocked(submitRsvp).mockResolvedValue({ status: "error", message: "RSVPs are closed." });
    const { trigger } = setup();
    await userEvent.click(trigger);
    await userEvent.type(screen.getByLabelText("Your name"), "Ada");
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.click(screen.getByRole("button", { name: "Confirm RSVP" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("RSVPs are closed.");
  });

  it("shows a pending state while saving", async () => {
    // React 19 entangles in-flight async actions across roots, so the
    // promise must settle before the test ends or later tests would wait on it.
    let finish!: (v: { status: "success"; name: string; emailed: boolean }) => void;
    vi.mocked(submitRsvp).mockImplementation(() => new Promise((resolve) => (finish = resolve)));
    const { trigger } = setup();
    await userEvent.click(trigger);
    await userEvent.type(screen.getByLabelText("Your name"), "Ada");
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.click(screen.getByRole("button", { name: "Confirm RSVP" }));
    expect(await screen.findByRole("button", { name: "Saving your spot…" })).toBeDisabled();
    await act(async () => finish({ status: "success", name: "Ada", emailed: true }));
    expect(await screen.findByText("See you there, Ada.")).toBeInTheDocument();
  });

  it("closes from the close button, the Done button, and the backdrop", async () => {
    vi.mocked(submitRsvp).mockResolvedValue({ status: "success", name: "Ada", emailed: true });
    const { trigger } = setup();
    const dialog = () => document.querySelector("dialog")!;

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(dialog()).not.toHaveAttribute("open");

    await userEvent.click(trigger);
    fireEvent.click(dialog());
    expect(dialog()).not.toHaveAttribute("open");

    await userEvent.click(trigger);
    await userEvent.type(screen.getByLabelText("Your name"), "Ada");
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.click(screen.getByRole("button", { name: "Confirm RSVP" }));
    await userEvent.click(await screen.findByRole("button", { name: "Done" }));
    expect(dialog()).not.toHaveAttribute("open");
  });

  it("doesn't close when clicking inside the panel", async () => {
    const { trigger } = setup();
    await userEvent.click(trigger);
    await userEvent.click(screen.getByLabelText("Your name"));
    expect(document.querySelector("dialog")).toHaveAttribute("open");
  });

  it("starts from a clean form each time it opens", async () => {
    vi.mocked(submitRsvp).mockResolvedValue({ status: "success", name: "Ada", emailed: true });
    const { trigger } = setup();
    await userEvent.click(trigger);
    await userEvent.type(screen.getByLabelText("Your name"), "Ada");
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.click(screen.getByRole("button", { name: "Confirm RSVP" }));
    await screen.findByText("See you there, Ada.");
    await userEvent.click(screen.getByRole("button", { name: "Done" }));

    await userEvent.click(trigger);
    expect(screen.getByLabelText("Your name")).toHaveValue("");
    expect(screen.queryByText("See you there, Ada.")).not.toBeInTheDocument();
  });
});

describe("HeroSlider", () => {
  const defaults = { heading: "Default heading", subheading: "Default sub" };
  const slides = [
    heroSlide({ id: "s1", image_url: "/1.jpg", heading: "First" }),
    heroSlide({ id: "s2", image_url: "/2.jpg", heading: null, subheading: "Second sub" }),
    heroSlide({ id: "s3", image_url: "/3.jpg", heading: "Third" }),
  ];
  const heading = () => screen.getByRole("heading", { level: 1 }).textContent;

  it("shows a single slide with no controls", () => {
    render(<HeroSlider slides={[slides[0]]} defaults={defaults} />);
    expect(heading()).toBe("First");
    expect(screen.queryByRole("button", { name: "Next slide" })).not.toBeInTheDocument();
  });

  it("falls back to the default copy for blank slide copy", () => {
    render(<HeroSlider slides={[slides[1]]} defaults={defaults} />);
    expect(heading()).toBe("Default heading");
    expect(screen.getByText("Second sub")).toBeInTheDocument();
  });

  it("moves with next/previous and wraps around", async () => {
    render(<HeroSlider slides={slides} defaults={defaults} />);
    await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(heading()).toBe("Default heading");
    await userEvent.click(screen.getByRole("button", { name: "Previous slide" }));
    await userEvent.click(screen.getByRole("button", { name: "Previous slide" }));
    expect(heading()).toBe("Third");
    await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(heading()).toBe("First");
  });

  it("jumps straight to a slide from its dot", async () => {
    render(<HeroSlider slides={slides} defaults={defaults} />);
    await userEvent.click(screen.getByRole("button", { name: "Go to slide 3" }));
    expect(heading()).toBe("Third");
  });

  it("only shows the current image", async () => {
    const { container } = render(<HeroSlider slides={slides} defaults={defaults} />);
    const slideImages = () => [...container.querySelectorAll("section > img")];
    const visible = () => slideImages().filter((i) => i.className.includes("opacity-100"));
    expect(slideImages()).toHaveLength(3);
    expect(visible().map((i) => i.getAttribute("src"))).toEqual(["/1.jpg"]);
  });

  it("advances every 6 seconds and pauses on hover", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    const { container } = render(<HeroSlider slides={slides} defaults={defaults} />);

    act(() => void vi.advanceTimersByTime(6000));
    expect(heading()).toBe("Default heading");

    fireEvent.mouseEnter(container.querySelector("section")!);
    act(() => void vi.advanceTimersByTime(20000));
    expect(heading()).toBe("Default heading");

    fireEvent.mouseLeave(container.querySelector("section")!);
    act(() => void vi.advanceTimersByTime(6000));
    expect(heading()).toBe("Third");
  });

  it("doesn't autoplay a single slide", () => {
    vi.useFakeTimers();
    render(<HeroSlider slides={[slides[0]]} defaults={defaults} />);
    act(() => void vi.advanceTimersByTime(60000));
    expect(heading()).toBe("First");
  });
});

describe("Reveal", () => {
  type MockIO = { instances: { trigger: (v?: boolean) => void }[] };
  const io = () => globalThis.IntersectionObserver as unknown as MockIO;

  it("starts hidden and becomes visible once on screen", () => {
    render(<Reveal className="extra" delay={120} id="anchor">Hello</Reveal>);
    const el = screen.getByText("Hello");
    expect(el).toHaveClass("reveal", "opacity-0", "extra");
    expect(el).toHaveAttribute("id", "anchor");

    act(() => io().instances.at(-1)!.trigger(true));
    expect(el).toHaveClass("opacity-100");
    expect(el.style.transitionDelay).toBe("120ms");
  });

  it("stays hidden while off screen", () => {
    render(<Reveal>Later</Reveal>);
    act(() => io().instances.at(-1)!.trigger(false));
    expect(screen.getByText("Later")).toHaveClass("opacity-0");
    expect(screen.getByText("Later").style.transitionDelay).toBe("");
  });
});

describe("SiteHeader", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/");
    Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
  });

  it("links home and to every nav page", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "St. Patrick's Catholic Church — home" })).toHaveAttribute("href", "/");
    for (const label of ["Home", "About Us", "Events", "Mass Schedule", "Projects"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("opens and closes the mobile menu", async () => {
    render(<SiteHeader />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("link", { name: "Events" })).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(screen.getAllByRole("link", { name: "Events" })).toHaveLength(1);
  });

  it("closes the mobile menu after navigating", async () => {
    const { rerender } = render(<SiteHeader />);
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    vi.mocked(usePathname).mockReturnValue("/events");
    rerender(<SiteHeader />);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("turns solid after scrolling past the hero", () => {
    const { container } = render(<SiteHeader />);
    const bar = () => container.querySelector(".rounded-full")!;
    expect(bar().className).toContain("bg-white/10");
    act(() => {
      (window as { scrollY: number }).scrollY = 200;
      window.dispatchEvent(new Event("scroll"));
    });
    expect(bar().className).toContain("bg-white/95");
  });

  it("stops listening to scroll when unmounted", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<SiteHeader />);
    unmount();
    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
  });
});

describe("SidebarNav", () => {
  const groups = [
    { label: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: <span /> }] },
    {
      label: "Services",
      items: [
        { href: "/admin/mass-bookings", label: "Mass Bookings", icon: <span />, badge: 3 },
        { href: "/admin/events", label: "Events", icon: <span />, badge: 150 },
        { href: "/admin/homilies", label: "Homilies", icon: <span />, badge: 0 },
      ],
    },
  ];

  it("renders groups, links and badges, capping big counts", () => {
    vi.mocked(usePathname).mockReturnValue("/admin");
    render(<SidebarNav groups={groups} />);
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mass Bookings/ })).toHaveTextContent("3");
    expect(screen.getByRole("link", { name: /Events/ })).toHaveTextContent("99+");
    expect(screen.getByRole("link", { name: "Homilies" })).toHaveTextContent(/^Homilies$/);
  });

  it("highlights the current section, including its sub-pages", () => {
    vi.mocked(usePathname).mockReturnValue("/admin/events/evt-1/photos");
    render(<SidebarNav groups={groups} />);
    expect(screen.getByRole("link", { name: /Events/ }).className).toContain("text-white");
    expect(screen.getByRole("link", { name: "Dashboard" }).className).not.toContain("bg-white/[0.07]");
  });

  it("only highlights the dashboard on the dashboard itself", () => {
    vi.mocked(usePathname).mockReturnValue("/admin");
    render(<SidebarNav groups={groups} />);
    expect(screen.getByRole("link", { name: "Dashboard" }).className).toContain("bg-white/[0.07]");
  });
});
