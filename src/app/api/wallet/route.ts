import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
      include: {
        transactions: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });

    if (!wallet) {
      const newWallet = await prisma.wallet.create({
        data: { userId: session.user.id, balance: 0 },
        include: { transactions: true },
      });
      return NextResponse.json(newWallet);
    }

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("Wallet fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
