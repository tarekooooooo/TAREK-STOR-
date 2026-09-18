import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canManageSupport, getAuthUser } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAgent = await canManageSupport(user);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const tickets = await prisma.supportTicket.findMany({
      where: {
        ...(isAgent ? {} : { userId: user.id }),
        ...(status ? { status } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, uniqueId: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Support tickets fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, message } = await req.json();
    if (!subject || !String(subject).trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject: String(subject).trim(),
        status: "open",
        ...(message && String(message).trim()
          ? {
              messages: {
                create: { senderId: user.id, body: String(message).trim() },
              },
            }
          : {}),
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Support ticket create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
