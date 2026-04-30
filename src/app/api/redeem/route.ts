import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const redeemCode = await prisma.redeemCode.findUnique({ where: { code } });
    if (!redeemCode || redeemCode.isUsed) {
      return NextResponse.json({ error: "Invalid or already used code" }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: redeemCode.value } },
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "recharge",
          amount: redeemCode.value,
          description: `Redeemed code: ${code}`,
          redeemCodeId: redeemCode.id,
        },
      }),
      prisma.redeemCode.update({
        where: { id: redeemCode.id },
        data: {
          isUsed: true,
          usedBy: session.user.uniqueId,
          usedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      value: redeemCode.value,
      newBalance: wallet.balance + redeemCode.value,
    });
  } catch (error) {
    console.error("Redeem error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { value, count } = await req.json();
    if (!value || !count || count < 1 || count > 100) {
      return NextResponse.json(
        { error: "Invalid value or count (max 100)" },
        { status: 400 }
      );
    }

    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(6).toString("hex").toUpperCase();
      codes.push({ code, value });
    }

    await prisma.redeemCode.createMany({ data: codes });

    return NextResponse.json({ codes: codes.map((c) => c.code), value, count });
  } catch (error) {
    console.error("Generate codes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
