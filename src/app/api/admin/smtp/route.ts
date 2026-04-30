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

    let config = await prisma.smtpConfig.findFirst();
    if (!config) {
      config = await prisma.smtpConfig.create({
        data: {
          host: "",
          port: 587,
          username: "",
          apiKey: "",
          fromName: "Tarek Store",
          fromEmail: "",
          isActive: false,
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("SMTP fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    let config = await prisma.smtpConfig.findFirst();
    if (!config) {
      config = await prisma.smtpConfig.create({
        data: {
          host: data.host || "",
          port: data.port || 587,
          username: data.username || "",
          apiKey: data.apiKey || "",
          fromName: data.fromName || "Tarek Store",
          fromEmail: data.fromEmail || "",
          isActive: data.isActive || false,
        },
      });
    } else {
      config = await prisma.smtpConfig.update({
        where: { id: config.id },
        data: {
          host: data.host,
          port: data.port,
          username: data.username,
          apiKey: data.apiKey,
          fromName: data.fromName,
          fromEmail: data.fromEmail,
          isActive: data.isActive,
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("SMTP update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
