import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "admin" || session.user.role === "superadmin";
    const orders = await prisma.order.findMany({
      where: isAdmin ? {} : { userId: session.user.id },
      include: { items: { include: { product: true } }, user: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity = 1 } = await req.json();

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.stock !== -1 && product.stock < quantity) {
      return NextResponse.json({ error: "Out of stock" }, { status: 400 });
    }

    const total = product.price * quantity;

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet || wallet.balance < total) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          userUid: session.user.uniqueId,
          total,
          status: "completed",
          items: {
            create: {
              productId: product.id,
              quantity,
              price: product.price,
            },
          },
        },
        include: { items: { include: { product: true } } },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: total } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "purchase",
          amount: -total,
          description: `Order #${newOrder.id}`,
          orderId: newOrder.id,
        },
      });

      if (product.stock !== -1) {
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: quantity } },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      order,
      deliveryContent: product.deliveryContent,
    }, { status: 201 });
  } catch (error) {
    console.error("Order create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
