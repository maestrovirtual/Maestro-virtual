/** @jest-environment node */
import { NextResponse } from "next/server";
import { POST } from "@/app/api/admin/messages/[id]/forward/route";
import prisma from "@/lib/prisma/client";
import { requireStaffApi } from "@/lib/auth/dal";
import { forwardContactMessage } from "@/services/mail/forwardContactMessage";

jest.mock("@/lib/auth/dal", () => ({ requireStaffApi: jest.fn() }));
jest.mock("@/services/mail/forwardContactMessage", () => ({ forwardContactMessage: jest.fn() }));
jest.mock("@/lib/prisma/client", () => ({ __esModule: true, default: { contactMessage: { findUnique: jest.fn() } } }));

const message = { id: "contact-1", name: "Ana", email: "ana@example.com", subject: "Consulta", message: "Hola", date: new Date() };
const context = { params: Promise.resolve({ id: "contact-1" }) };
const req = () => new Request("http://localhost/api/admin/messages/contact-1/forward", { method: "POST" });

beforeEach(() => {
  jest.resetAllMocks();
  (requireStaffApi as jest.Mock).mockResolvedValue(null);
  (prisma.contactMessage.findUnique as jest.Mock).mockResolvedValue(message);
  (forwardContactMessage as jest.Mock).mockResolvedValue({ data: { id: "forward-1" }, error: null });
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test.each([401, 403])("requires staff access (%s)", async status => {
  (requireStaffApi as jest.Mock).mockResolvedValue(NextResponse.json({ error: "Denied" }, { status }));
  const response = await POST(req(), context);
  expect(response.status).toBe(status);
  expect(forwardContactMessage).not.toHaveBeenCalled();
});

test("forwards the message and returns success", async () => {
  const response = await POST(req(), context);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ success: true });
  expect(forwardContactMessage).toHaveBeenCalledWith("contact-1", message);
});

test("returns 404 when the message does not exist", async () => {
  (prisma.contactMessage.findUnique as jest.Mock).mockResolvedValue(null);
  const response = await POST(req(), context);
  expect(response.status).toBe(404);
  expect(forwardContactMessage).not.toHaveBeenCalled();
});

test("returns 502 when the mail provider rejects the forward", async () => {
  (forwardContactMessage as jest.Mock).mockResolvedValue({ error: { message: "offline" } });
  const response = await POST(req(), context);
  expect(response.status).toBe(502);
});
