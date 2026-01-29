import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, type, date, description, walletId, categoryId } = body;

    // 1. Provera podataka
    if (!amount || !walletId || !categoryId || !type) {
      return NextResponse.json(
        { error: "Fale obavezni podaci" },
        { status: 400 }
      );
    }

    // 2. Transakcija baze
    // DODALI SMO ": any" PORED tx DA SKLONIMO CRVENO
    const result = await prisma.$transaction(async (tx: any) => {
      
      // KORAK A: Prvo nađemo novčanik da vidimo čiji je
      const wallet = await tx.wallet.findUnique({
        where: { id: parseInt(walletId) }
      });

      if (!wallet) {
        throw new Error("Novčanik ne postoji!");
      }

      // KORAK B: Kreiramo transakciju
      const transaction = await tx.transaction.create({
        data: {
          amount: parseFloat(amount),
          type, 
          date: new Date(date),
          description,
          walletId: parseInt(walletId),
          categoryId: parseInt(categoryId),
          userId: wallet.userId 
        },
      });

      // KORAK C: Ažuriramo stanje novčanika
      if (type === "INCOME") {
        await tx.wallet.update({
          where: { id: parseInt(walletId) },
          data: { balance: { increment: parseFloat(amount) } },
        });
      } else {
        await tx.wallet.update({
          where: { id: parseInt(walletId) },
          data: { balance: { decrement: parseFloat(amount) } },
        });
      }

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Greska:", error);
    return NextResponse.json(
      { error: "Greška prilikom kreiranja transakcije" },
      { status: 500 }
    );
  }
}

// --- GET METODA ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      // Ako nema ID-a, vratimo prazan niz da ne puca Front
      return NextResponse.json([], { status: 200 });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: parseInt(userId)
      },
      include: {
        category: true,
        wallet: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 50
    });

    return NextResponse.json(transactions, { status: 200 });

  } catch (error) {
    console.error("Greška pri učitavanju:", error);
    // BITNA IZMENA: Vraćamo prazan niz [] umesto greške, da ne pukne .map()
    return NextResponse.json([], { status: 500 });
  }
}