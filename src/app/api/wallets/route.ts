import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

// 1. GET: Vraća novčanike, ali traži ID korisnika u URL-u
export async function GET(request: Request) {
  try {
    // Uzimamo userId iz URL-a (npr. /api/wallets?userId=5)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Niste ulogovani" }, { status: 401 });
    }

    const wallets = await prisma.wallet.findMany({
      where: {
        userId: parseInt(userId), // Pretvaramo string "5" u broj 5
      },
    });

    return NextResponse.json(wallets, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Greška prilikom dovlačenja novčanika" },
      { status: 500 }
    );
  }
}

// 2. POST: Kreira novčanik za određenog korisnika
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, balance, currency, userId } = body; // Čekamo i userId

    if (!name || !userId) {
      return NextResponse.json(
        { error: "Podaci nisu kompletni" },
        { status: 400 }
      );
    }

    const newWallet = await prisma.wallet.create({
      data: {
        name,
        balance: balance || 0,
        currency: currency || "RSD",
        userId: parseInt(userId), // Vezujemo za pravog korisnika!
      },
    });

    return NextResponse.json(newWallet, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Greška prilikom kreiranja novčanika" },
      { status: 500 }
    );
  }
}