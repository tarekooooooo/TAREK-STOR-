import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const SUPER_ADMIN_EMAIL = "tarekai042@gmail.com";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admins = await prisma.user.findMany({
      where: { role: { in: ["admin", "superadmin"] } },
      select: {
        id: true,
        uniqueId: true,
        name: true,
        email: true,
        role: true,
        subAdminPermissions: true,
      },
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error("Sub-admins fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Only super admin can manage sub-admins" }, { status: 403 });
    }

    const { userId, permissions } = await req.json();

    await prisma.user.update({
      where: { id: userId },
      data: { role: "admin" },
    });

    await prisma.subAdminPermission.upsert({
      where: { userId },
      update: { ...permissions },
      create: { userId, ...permissions },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sub-admin create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Only super admin can manage sub-admins" }, { status: 403 });
    }

    const { userId } = await req.json();

    await prisma.subAdminPermission.deleteMany({ where: { userId } });
    await prisma.user.update({
      where: { id: userId },
      data: { role: "user" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sub-admin delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
