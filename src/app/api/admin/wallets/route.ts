import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallets = await prisma.wallet.findMany({
      include: {
        user: { select: { name: true, email: true, uniqueId: true } },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(wallets);
  } catch (error) {
    console.error("Wallets fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { walletId, amount, type, description } = await req.json();

    if (!walletId || !amount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const numAmount = Number(amount);

    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: walletId },
        data: { balance: { increment: numAmount } },
      }),
      prisma.walletTransaction.create({
        data: {
          walletId,
          type,
          amount: numAmount,
          description: description || `Admin ${type}: $${Math.abs(numAmount)}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wallet update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
