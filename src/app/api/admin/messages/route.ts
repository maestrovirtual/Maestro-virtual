import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { requireStaffApi } from "@/lib/auth/dal";
import { CONTACT_CATEGORIES, isContactCategory } from "@/lib/contact/categories";

export async function GET(request: Request) {
  try {
    const denied = await requireStaffApi();
    if (denied) return denied;
    const search = new URL(request.url).searchParams;
    const view = search.get("view") ?? "inbox";
    if (view !== "inbox" && view !== "archived" && view !== "spam") {
      return NextResponse.json({ error: "Vista inválida" }, { status: 400 });
    }
    // La categoría filtra dentro de la carpeta elegida; sin ella se muestran todas.
    const rawCategory = search.get("category");
    if (rawCategory !== null && !isContactCategory(rawCategory)) {
      return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
    }
    const folder = { isArchived: view === "archived", isSpam: view === "spam" };
    const where = rawCategory ? { ...folder, category: rawCategory } : folder;
    const rawPage = search.get("page") ?? "1";
    const page = Number(rawPage);
    if (!Number.isSafeInteger(page) || page < 1 || page > 100000) {
      return NextResponse.json({ error: "Página inválida" }, { status: 400 });
    }
    const pageSize = 20;
    const [messages, total, unreadInbox, unreadArchived, unreadSpam, unreadByCategory] = await prisma.$transaction([
      prisma.contactMessage.findMany({
        where,
        include: { _count: { select: { replies: { where: { status: "SENT", direction: "OUTBOUND" } } } } },
        orderBy: [{ lastActivityAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({ where: { isRead: false, isSpam: false, isArchived: false } }),
      prisma.contactMessage.count({ where: { isRead: false, isSpam: false, isArchived: true } }),
      prisma.contactMessage.count({ where: { isRead: false, isSpam: true, isArchived: false } }),
      prisma.contactMessage.groupBy({ by: ["category"], where: { ...folder, isRead: false }, orderBy: { category: "asc" }, _count: { _all: true } }),
    ]);
    const categoryCounts = Object.fromEntries(CONTACT_CATEGORIES.map(({ value }) => {
      const count = unreadByCategory.find(group => group.category === value)?._count;
      return [value, typeof count === "object" ? count._all ?? 0 : 0];
    }));
    return NextResponse.json({ messages, total, page, pageSize, mailProvider: process.env.MAIL_PROVIDER || "resend", unreadCounts: { inbox: unreadInbox, archived: unreadArchived, spam: unreadSpam }, categoryUnreadCounts: categoryCounts }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    return NextResponse.json({ error: "No se pudieron cargar los mensajes" }, { status: 500 });
  }
}
