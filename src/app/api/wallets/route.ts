import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

// 1. GET metoda - Vraća sve novčanike za korisnika
export async function GET() {
  try {
    
    const wallets = await prisma.wallet.findMany({
      where: {
        userId: 1, 
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

// 2. POST metoda - Kreira novi novčanik
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, balance, currency } = body;

    // Validacija
    if (!name) {
      return NextResponse.json(
        { error: "Ime novčanika je obavezno" },
        { status: 400 }
      );
    }

    const newWallet = await prisma.wallet.create({
      data: {
        name,
        balance: balance || 0,
        currency: currency || "RSD",
        userId: 1, // Privremeno zakucano
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