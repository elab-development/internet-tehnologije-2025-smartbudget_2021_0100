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
    const result = await prisma.$transaction(async (tx) => {
      
      // KORAK A: Prvo nađemo novčanik da vidimo čiji je (treba nam userId)
      const wallet = await tx.wallet.findUnique({
        where: { id: parseInt(walletId) }
      });

      if (!wallet) {
        throw new Error("Novčanik ne postoji!");
      }

      // KORAK B: Kreiramo transakciju koristeći direktan userId (bez 'connect')
      const transaction = await tx.transaction.create({
        data: {
          amount: parseFloat(amount),
          type, 
          date: new Date(date),
          description,
          walletId: parseInt(walletId),
          categoryId: parseInt(categoryId),
          userId: wallet.userId // <--- OVO JE FIX! Samo prosledimo broj.
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