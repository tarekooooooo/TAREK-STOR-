import { NextRequest, NextResponse } from "next/server";
// NextRequest used in PUT handler
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return NextResponse.json(map);
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key, value } = await req.json();
    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userUid: session.user.uniqueId,
        action: "settings_change",
        details: `Changed ${key} to ${value}`,
      },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.setting.findMany();
    const grouped: Record<string, Array<{ key: string; value: string; label: string | null; group: string | null }>> = {};

    for (const s of settings) {
      const group = s.group || "other";
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(s);
    }

    return NextResponse.json(grouped);
  } catch (error) {
    console.error("Settings grouped error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
