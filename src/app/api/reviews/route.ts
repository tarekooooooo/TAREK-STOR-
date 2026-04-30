import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { name: true, uniqueId: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, rating, comment } = await req.json();

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: session.user.id, status: "completed" },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { error: "You must purchase this product before reviewing" },
        { status: 403 }
      );
    }

    const review = await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      update: { rating, comment: comment || null },
      create: {
        userId: session.user.id,
        productId,
        rating,
        comment: comment || null,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Review create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
