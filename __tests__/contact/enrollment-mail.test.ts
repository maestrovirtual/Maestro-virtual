/** @jest-environment node */
import { sendEnrollmentConfirmation } from "@/services/mail/sendEnrollmentConfirmation";

const send = jest.fn().mockResolvedValue({ data: { id: "email" }, error: null });
jest.mock("@/lib/mail/resend", () => ({ getResend: () => ({ emails: { send } }) }));

beforeEach(() => {
  send.mockClear();
  process.env.MAIL_FROM = "Maestro Virtual <avisos@maestrovirtual.org>";
});

test("sends a course confirmation with the course details", async () => {
  await sendEnrollmentConfirmation({
    name: "Ana <script>",
    email: "ana@example.com",
    item: { type: "course", title: "Excel básico", duration: "4 semanas", modality: "En línea", participants: "20" },
  });

  expect(send).toHaveBeenCalledTimes(1);
  const call = send.mock.calls[0][0];
  expect(call.to).toBe("ana@example.com");
  expect(call.from).toBe("Maestro Virtual <avisos@maestrovirtual.org>");
  expect(call.subject).toBe("[Maestro Virtual] Confirmación de inscripción: Excel básico");
  expect(call.html).toContain("Ana &lt;script&gt;");
  expect(call.html).toContain("Excel básico");
  expect(call.html).toContain("4 semanas");
  expect(call.html).not.toContain("<script>");
});

test("sends an event confirmation with date, schedule and modality", async () => {
  await sendEnrollmentConfirmation({
    name: "Luis",
    email: "luis@example.com",
    item: {
      type: "event",
      title: "Taller de Canva",
      date: "2026-11-20",
      time: "10:00 - 12:00 hrs",
      modality: "presencial",
      location: "Auditorio Central",
      address: "Av. Siempre Viva 123",
    },
  });

  const call = send.mock.calls[0][0];
  expect(call.subject).toBe("[Maestro Virtual] Confirmación de inscripción: Taller de Canva");
  expect(call.html).toContain("Taller de Canva");
  expect(call.html).toContain("10:00 - 12:00 hrs");
  expect(call.html).toContain("Auditorio Central");
  expect(call.html).toContain("Av. Siempre Viva 123");
  expect(call.html.toLowerCase()).toContain("viernes");
});

test("falls back to onboarding@resend.dev when MAIL_FROM is not configured", async () => {
  delete process.env.MAIL_FROM;
  await sendEnrollmentConfirmation({
    name: "Luis",
    email: "luis@example.com",
    item: { type: "course", title: "Curso", duration: "1 mes", modality: "Online" },
  });
  expect(send.mock.calls[0][0].from).toBe("onboarding@resend.dev");
});
