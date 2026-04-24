import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateUniqueId } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
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

    const isAdmin = email === "tarekai042@gmail.com";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        uniqueId,
        role: isAdmin ? "admin" : "user",
        wallet: { create: { balance: 0 } },
      },
      select: { id: true, uniqueId: true, name: true, email: true, role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
