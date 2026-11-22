import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordField } from "@/app/login/password-field";
import { ParentFields } from "@/app/baptism-request/parent-fields";
import { ScheduleFields } from "@/app/admin/baptism-inquiries/[id]/schedule-fields";
import { SubmitButton, Spinner } from "@/components/submit-button";
import { PrintButton } from "@/components/print-button";

describe("PasswordField", () => {
  it("starts hidden and toggles visibility", async () => {
    render(<PasswordField id="password" name="password" autoComplete="current-password" />);
    const input = document.getElementById("password") as HTMLInputElement;
    const toggle = screen.getByRole("button", { name: "Show password" });

    expect(input.type).toBe("password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(toggle);
    expect(input.type).toBe("text");
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input.type).toBe("password");
  });

  it("passes through its form attributes and is required", () => {
    render(
      <PasswordField id="pw" name="new" autoComplete="new-password" minLength={8} describedBy="pw-hint" />,
    );
    const input = document.getElementById("pw") as HTMLInputElement;
    expect(input).toHaveAttribute("name", "new");
    expect(input).toHaveAttribute("autocomplete", "new-password");
    expect(input).toHaveAttribute("minlength", "8");
    expect(input).toHaveAttribute("aria-describedby", "pw-hint");
    expect(input).toBeRequired();
  });

  it("doesn't submit the form when toggled", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <PasswordField id="pw" name="pw" autoComplete="current-password" />
      </form>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("ParentFields", () => {
  function setup() {
    render(<ParentFields inputClass="in" labelClass="lab" />);
    return {
      father: screen.getByLabelText("Father’s name") as HTMLInputElement,
      mother: screen.getByLabelText("Mother’s name") as HTMLInputElement,
    };
  }

  it("requires both while both are empty", () => {
    const { father, mother } = setup();
    expect(father).toBeRequired();
    expect(mother).toBeRequired();
    expect(screen.getByText("Enter at least one parent or guardian.")).toBeInTheDocument();
  });

  it("drops the requirement from both once either is filled", async () => {
    const { father, mother } = setup();
    await userEvent.type(mother, "Grace");
    expect(father).not.toBeRequired();
    expect(mother).not.toBeRequired();
  });

  it("treats whitespace as empty", async () => {
    const { father, mother } = setup();
    await userEvent.type(father, "   ");
    expect(mother).toBeRequired();
  });

  it("requires them again when cleared", async () => {
    const { father, mother } = setup();
    await userEvent.type(father, "John");
    await userEvent.clear(father);
    expect(mother).toBeRequired();
  });

  it("submits under the right field names", () => {
    const { father, mother } = setup();
    expect(father.name).toBe("father_name");
    expect(mother.name).toBe("mother_name");
  });
});

describe("ScheduleFields", () => {
  type Initial = Parameters<typeof ScheduleFields>[0]["initial"];
  const blank: Initial = {
    baptism_date: null,
    baptism_time: null,
    baptism_place: null,
    practice_date: null,
    practice_time: null,
    practice_place: null,
  };

  function setup(initial: Initial = blank) {
    render(<ScheduleFields today="2026-06-15" defaultPlace="St. Patrick's" initial={initial} />);
    const byId = (id: string) => document.getElementById(id) as HTMLInputElement;
    return {
      baptismDate: byId("baptism_date"),
      baptismTime: byId("baptism_time"),
      baptismPlace: byId("baptism_place"),
      practiceDate: byId("practice_date"),
      practiceTime: byId("practice_time"),
      practicePlace: byId("practice_place"),
    };
  }

  it("blocks past baptism dates and fills both places with the parish", () => {
    const f = setup();
    expect(f.baptismDate.min).toBe("2026-06-15");
    expect(f.baptismPlace.value).toBe("St. Patrick's");
    expect(f.practicePlace.value).toBe("St. Patrick's");
    for (const el of Object.values(f)) expect(el).toBeRequired();
  });

  it("limits the practice to the day before the chosen baptism", () => {
    const f = setup();
    expect(f.practiceDate.max).toBe("");
    fireEvent.change(f.baptismDate, { target: { value: "2026-08-02" } });
    expect(f.practiceDate.max).toBe("2026-08-01");
  });

  it("handles month and year boundaries", () => {
    const f = setup();
    fireEvent.change(f.baptismDate, { target: { value: "2027-01-01" } });
    expect(f.practiceDate.max).toBe("2026-12-31");
    fireEvent.change(f.baptismDate, { target: { value: "2028-03-01" } });
    expect(f.practiceDate.max).toBe("2028-02-29");
  });

  it("warns when the baptism moves on or before the chosen practice", () => {
    const f = setup();
    fireEvent.change(f.baptismDate, { target: { value: "2026-08-02" } });
    fireEvent.change(f.practiceDate, { target: { value: "2026-07-30" } });
    expect(screen.getByText("Must be on a day before the baptism.")).toBeInTheDocument();
    expect(f.practiceDate).not.toHaveAttribute("aria-invalid");

    fireEvent.change(f.baptismDate, { target: { value: "2026-07-30" } });
    expect(screen.getByText("The practice has to be on a day before the baptism.")).toBeInTheDocument();
    expect(f.practiceDate).toHaveAttribute("aria-invalid", "true");
  });

  it("pre-fills an existing schedule, trimming seconds off times", () => {
    const f = setup({
      baptism_date: "2026-08-02",
      baptism_time: "10:00:00",
      baptism_place: "Main Church",
      practice_date: "2026-07-30",
      practice_time: "17:30:00",
      practice_place: "Parish Hall",
    });
    expect(f.baptismDate.value).toBe("2026-08-02");
    expect(f.baptismTime.value).toBe("10:00");
    expect(f.baptismPlace.value).toBe("Main Church");
    expect(f.practiceDate.value).toBe("2026-07-30");
    expect(f.practiceDate.max).toBe("2026-08-01");
    expect(f.practiceTime.value).toBe("17:30");
    expect(f.practicePlace.value).toBe("Parish Hall");
  });
});

describe("SubmitButton", () => {
  it("is an enabled submit button with its label", () => {
    render(
      <form>
        <SubmitButton pendingText="Sending…">Send</SubmitButton>
      </form>,
    );
    const button = screen.getByRole("button", { name: "Send" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute("aria-busy", "false");
  });

  it("disables itself and shows the pending text while the form's action runs", async () => {
    let finish!: () => void;
    const action = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(
      <form action={action}>
        <SubmitButton pendingText="Sending…">Send</SubmitButton>
      </form>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    const busy = await screen.findByRole("button", { name: "Sending…" });
    expect(busy).toBeDisabled();
    expect(busy).toHaveAttribute("aria-busy", "true");

    await act(async () => finish());
    expect(await screen.findByRole("button", { name: "Send" })).toBeEnabled();
  });

  it("keeps its label while pending when no pending text is given", async () => {
    let finish!: () => void;
    const action = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(
      <form action={action}>
        <SubmitButton>Save</SubmitButton>
      </form>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("button", { name: "Save" })).toBeDisabled();
    await act(async () => finish());
  });

  it("forwards extra props and classes", () => {
    render(<SubmitButton className="extra" data-testid="b">Go</SubmitButton>);
    expect(screen.getByTestId("b")).toHaveClass("extra");
  });
});

describe("Spinner", () => {
  it("is decorative", () => {
    const { container } = render(<Spinner className="size-4" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden");
    expect(svg).toHaveClass("animate-spin", "size-4");
  });
});

describe("PrintButton", () => {
  it("opens the print dialog", async () => {
    render(<PrintButton className="btn">Print certificate</PrintButton>);
    await userEvent.click(screen.getByRole("button", { name: "Print certificate" }));
    expect(window.print).toHaveBeenCalled();
  });
});
