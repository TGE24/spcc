// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
const ResendCtor = vi.fn(function (this: { emails: { send: typeof send } }) {
  this.emails = { send };
});
vi.mock("resend", () => ({ Resend: ResendCtor }));

const message = { to: "family@example.com", subject: "Hello", html: "<p>Hi</p>", text: "Hi" };

async function loadSendEmail() {
  vi.resetModules();
  return (await import("@/lib/email")).sendEmail;
}

beforeEach(() => {
  send.mockReset();
  send.mockResolvedValue({ data: { id: "email-1" }, error: null });
  ResendCtor.mockClear();
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("RESEND_FROM_EMAIL", "office@parish.org");
  vi.stubEnv("RESEND_FROM_NAME", "St. Patrick's Parish Office");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sendEmail", () => {
  it("sends through Resend from the configured name and address", async () => {
    const sendEmail = await loadSendEmail();
    await sendEmail(message);

    expect(ResendCtor).toHaveBeenCalledWith("re_test");
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "St. Patrick's Parish Office <office@parish.org>",
        to: "family@example.com",
        replyTo: "hello@saintpatrickbasorun.org",
        subject: "Hello",
        html: "<p>Hi</p>",
        text: "Hi",
      }),
    );
  });

  it("attaches the parish logo inline for the cid: header image", async () => {
    const sendEmail = await loadSendEmail();
    await sendEmail(message);

    const [{ attachments }] = send.mock.calls[0];
    expect(attachments).toEqual([
      expect.objectContaining({ filename: "st-patricks-logo.png", contentType: "image/png", contentId: "parish-logo" }),
    ]);
    expect(Buffer.from(attachments[0].content, "base64").subarray(1, 4).toString()).toBe("PNG");
  });

  it("defaults the sender name to the parish name", async () => {
    vi.stubEnv("RESEND_FROM_NAME", "");
    const sendEmail = await loadSendEmail();
    await sendEmail(message);
    expect(send.mock.calls[0][0].from).toBe("St. Patrick's Catholic Church, Basorun <office@parish.org>");
  });

  it("skips quietly when RESEND_API_KEY isn't set", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const sendEmail = await loadSendEmail();

    await expect(sendEmail(message)).resolves.toBeUndefined();
    expect(send).not.toHaveBeenCalled();
    expect(warn.mock.calls[0][0]).toMatch(/RESEND_API_KEY/);
  });

  it("skips quietly when RESEND_FROM_EMAIL isn't set", async () => {
    vi.stubEnv("RESEND_FROM_EMAIL", "");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const sendEmail = await loadSendEmail();

    await sendEmail(message);
    expect(send).not.toHaveBeenCalled();
    expect(warn.mock.calls[0][0]).toMatch(/RESEND_FROM_EMAIL/);
  });

  it("logs, but never throws, when Resend rejects the email", async () => {
    send.mockResolvedValueOnce({ data: null, error: { message: "domain not verified" } });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const sendEmail = await loadSendEmail();

    await expect(sendEmail(message)).resolves.toBeUndefined();
    expect(log.mock.calls[0][0]).toMatch(/Resend rejected "Hello"/);
  });

  it("logs, but never throws, when the request itself fails", async () => {
    send.mockRejectedValueOnce(new Error("network down"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const sendEmail = await loadSendEmail();

    await expect(sendEmail(message)).resolves.toBeUndefined();
    expect(log.mock.calls[0][0]).toMatch(/Failed to send "Hello"/);
  });

  it("reuses one Resend client across sends", async () => {
    const sendEmail = await loadSendEmail();
    await sendEmail(message);
    await sendEmail(message);
    expect(ResendCtor).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(2);
  });
});
