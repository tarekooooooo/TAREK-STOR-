import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateUniqueId, SUPER_ADMIN_EMAIL } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Check if registration is enabled
    const regSetting = await prisma.setting.findUnique({ where: { key: "registration_enabled" } });
    if (regSetting && regSetting.value === "false") {
      return NextResponse.json({ error: "Registration is currently disabled" }, { status: 403 });
    }

    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    let uniqueId = generateUniqueId();
    let idExists = await prisma.user.findUnique({ where: { uniqueId } });
    while (idExists) {
      uniqueId = generateUniqueId();
      idExists = await prisma.user.findUnique({ where: { uniqueId } });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const isSuperAdmin = email === SUPER_ADMIN_EMAIL;

    // Check for registration bonus
    const bonusSetting = await prisma.setting.findUnique({ where: { key: "registration_bonus_enabled" } });
    const bonusAmountSetting = await prisma.setting.findUnique({ where: { key: "registration_bonus_amount" } });
    const bonusEnabled = bonusSetting?.value === "true";
    const bonusAmount = bonusEnabled ? Number(bonusAmountSetting?.value || 0) : 0;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        uniqueId,
        role: isSuperAdmin ? "superadmin" : "user",
        wallet: { create: { balance: bonusAmount } },
      },
      select: { id: true, uniqueId: true, name: true, email: true, role: true },
    });

    if (bonusAmount > 0) {
      const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
      if (wallet) {
        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "reward",
            amount: bonusAmount,
            description: "Registration bonus",
          },
        });
      }
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
