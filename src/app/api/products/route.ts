import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, isAdmin } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const country = searchParams.get("country");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;
    if (type) where.type = type;

    const products = await prisma.product.findMany({
      where,
      include: {
        reviews: { select: { rating: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    let filtered = country
      ? products.filter(
          (p) => !p.countries || p.countries.split(",").includes(country)
        )
      : products;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
          (p.nameFr && p.nameFr.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    const result = filtered.map((p) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0;
      return {
        ...p,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: p.reviews.length,
        reviews: undefined,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    if (!data.name || !data.description || !data.category) {
      return NextResponse.json(
        { error: "Name, description, and category are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        nameEn: data.nameEn || null,
        nameFr: data.nameFr || null,
        description: data.description,
        descriptionEn: data.descriptionEn || null,
        descriptionFr: data.descriptionFr || null,
        price: Number(data.price) || 0,
        image: data.image || null,
        category: data.category,
        type: data.type || "product",
        deliveryContent: data.deliveryContent || null,
        countries: data.countries || null,
        isActive: data.isActive !== false,
        stock: data.stock !== undefined ? Number(data.stock) : -1,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json(
      { error: "Failed to create product. Please check all fields." },
      { status: 500 }
    );
  }
}
