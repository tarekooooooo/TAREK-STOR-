import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const participationType = searchParams.get("participationType");
    const fee = searchParams.get("fee");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (participationType) where.participationType = participationType;
    if (status) where.status = status;
    if (fee === "free") where.entryFee = 0;
    if (fee === "paid") where.entryFee = { gt: 0 };

    const tournaments = await prisma.tournament.findMany({
      where,
      include: {
        _count: { select: { participants: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tournaments);
  } catch (error) {
    console.error("Tournaments fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const maxPlayers = data.type === "classic" ? 100 : 8;

    const tournament = await prisma.tournament.create({
      data: {
        name: data.name,
        nameEn: data.nameEn || null,
        nameFr: data.nameFr || null,
        description: data.description || null,
        descriptionEn: data.descriptionEn || null,
        descriptionFr: data.descriptionFr || null,
        type: data.type || "classic",
        participationType: data.participationType || "solo",
        maxPlayers: data.maxPlayers || maxPlayers,
        entryFee: Number(data.entryFee) || 0,
        prize: Number(data.prize) || 0,
        hasReward: data.hasReward || false,
        rewardDescription: data.rewardDescription || null,
        rules: data.rules || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        image: data.image || null,
        city: data.city || null,
        country: data.country || null,
      },
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    console.error("Tournament create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tournamentId, teamCode, gameId } = await req.json();

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { _count: { select: { participants: true } } },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (tournament.status !== "open") {
      return NextResponse.json({ error: "Registration is closed" }, { status: 400 });
    }

    if (tournament._count.participants >= tournament.maxPlayers) {
      return NextResponse.json({ error: "Tournament is full" }, { status: 400 });
    }

    const existing = await prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already registered" }, { status: 400 });
    }

    if (tournament.entryFee > 0) {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: session.user.id },
      });

      if (!wallet || wallet.balance < tournament.entryFee) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: tournament.entryFee } },
        }),
        prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "purchase",
            amount: -tournament.entryFee,
            description: `Tournament entry: ${tournament.name}`,
          },
        }),
      ]);
    }

    let generatedTeamCode = teamCode;
    const isLeader = !teamCode && tournament.participationType !== "solo";

    if (isLeader) {
      generatedTeamCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    }

    if (teamCode && tournament.participationType !== "solo") {
      const teamMembers = await prisma.tournamentParticipant.count({
        where: { tournamentId, teamCode },
      });

      const maxTeamSize = tournament.participationType === "duo" ? 2 : 4;
      if (teamMembers >= maxTeamSize) {
        return NextResponse.json({ error: "Team is full" }, { status: 400 });
      }
    }

    const participant = await prisma.tournamentParticipant.create({
      data: {
        tournamentId,
        userId: session.user.id,
        teamCode: generatedTeamCode || null,
        isLeader,
        gameId: gameId || null,
      },
    });

    return NextResponse.json({
      participant,
      teamCode: generatedTeamCode,
    });
  } catch (error) {
    console.error("Tournament join error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
