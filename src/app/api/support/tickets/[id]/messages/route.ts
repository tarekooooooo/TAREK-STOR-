import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canManageSupport, getAuthUser } from "@/lib/apiAuth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const isAgent = await canManageSupport(user);
    if (ticket.userId !== user.id && !isAgent) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.supportMessage.findMany({
      where: { ticketId: params.id },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, role: true, uniqueId: true } },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Support messages fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const isAgent = await canManageSupport(user);
    const isOwner = ticket.userId === user.id;
    if (!isOwner && !isAgent) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (ticket.status === "closed") {
      return NextResponse.json({ error: "Ticket is closed" }, { status: 400 });
    }

    const { body } = await req.json();
    if (!body || !String(body).trim()) {
      return NextResponse.json({ error: "Message body is required" }, { status: 400 });
    }

    const [message] = await prisma.$transaction([
      prisma.supportMessage.create({
        data: {
          ticketId: params.id,
          senderId: user.id,
          body: String(body).trim(),
        },
        include: {
          sender: { select: { id: true, name: true, role: true, uniqueId: true } },
        },
      }),
      prisma.supportTicket.update({
        where: { id: params.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Support message create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
