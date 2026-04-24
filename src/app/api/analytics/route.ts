import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalUsers,
      totalOrders,
      totalVisits,
      revenueResult,
      recentOrders,
      topCountries,
      userGrowth,
      walletLogs,
      redeemCodes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.visit.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: true, items: { include: { product: true } } },
      }),
      prisma.visit.groupBy({
        by: ["country"],
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: 10,
      }),
      prisma.user.groupBy({
        by: ["createdAt"],
        _count: { id: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.walletTransaction.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: { wallet: { include: { user: true } } },
      }),
      prisma.redeemCode.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const totalRevenue = revenueResult._sum.total || 0;

    const monthlyGrowth: Record<string, number> = {};
    for (const entry of userGrowth) {
      const month = new Date(entry.createdAt).toISOString().slice(0, 7);
      monthlyGrowth[month] = (monthlyGrowth[month] || 0) + entry._count.id;
    }

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalVisits,
      totalRevenue,
      recentOrders,
      topCountries: topCountries.map((c) => ({
        country: c.country || "Unknown",
        count: c._count.country,
      })),
      userGrowth: Object.entries(monthlyGrowth).map(([month, count]) => ({
        month,
        count,
      })),
      walletLogs,
      redeemCodes,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { page, country, userId, ip, userAgent } = await req.json();

    await prisma.visit.create({
      data: { page, country, userId, ip, userAgent },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Visit tracking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
