import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const country = searchParams.get("country");

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;
    if (type) where.type = type;

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const filtered = country
      ? products.filter(
          (p) => !p.countries || p.countries.split(",").includes(country)
        )
      : products;

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const product = await prisma.product.create({ data });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
